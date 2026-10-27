"""Recover exact release payloads into a NEW Git repository, then add current source.

No working files are removed or replaced. Only Git history/index and the final
RELEASE_SNAPSHOT.json are written. Requires the original local dist archives.
"""
import hashlib
import io
import json
import pathlib
import subprocess
import time
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
VERSIONS = ['0.1.1', '0.2.0', '0.3.0', '0.4.0', '0.4.1', '0.4.2', '0.4.3']


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def main():
    if subprocess.run(['git', 'rev-parse', '--verify', 'HEAD'], cwd=ROOT,
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
        raise SystemExit('Refusing: this importer requires a repository with no commits.')
    if git('for-each-ref').strip():
        raise SystemExit('Refusing: repository already has refs.')
    name = git('config', 'user.name').decode().strip()
    email = git('config', 'user.email').decode().strip()
    if any(c in name + email for c in '\n\r<>'):
        raise SystemExit('Invalid Git identity')
    archives = [(v, ROOT / 'dist' / f'FoodAndTable-{v}.mcaddon') for v in VERSIONS]
    for _, path in archives:
        if not path.is_file():
            raise SystemExit(f'Missing archive: {path.name}')
    # Capture source before importing; ignored build output is intentionally absent.
    sources = [p.decode('utf-8') for p in git('ls-files', '--others', '--exclude-standard', '-z').split(b'\0')
               if p and not p.startswith(b'packs/')]
    payloads = []
    for version, path in archives:
        files = {}
        with zipfile.ZipFile(path) as addon:
            for pack_name in ['FoodAndTable_BP', 'FoodAndTable_RP']:
                with zipfile.ZipFile(io.BytesIO(addon.read(pack_name + '.mcpack'))) as pack:
                    for member in pack.infolist():
                        if member.is_dir():
                            continue
                        relative = pathlib.PurePosixPath(member.filename)
                        if relative.is_absolute() or '..' in relative.parts or '\\' in member.filename:
                            raise SystemExit(f'Unsafe archive path: {member.filename}')
                        files[f'packs/{pack_name}/{relative}'] = pack.read(member)
        metadata = {
            'version': version, 'archive': path.name,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'packFiles': len(files),
            'historyKind': 'recovered release payload' if version != VERSIONS[-1] else 'release payload and current full source',
            'originalDevelopmentTimestampAvailable': False,
            'historicalFullSourceAvailable': version == VERSIONS[-1],
        }
        files['RELEASE_SNAPSHOT.json'] = (json.dumps(metadata, ensure_ascii=False, indent=2) + '\n').encode()
        payloads.append((version, files))
    # Refuse to attach mismatched current source to the final published payload.
    final_files = payloads[-1][1]
    current_packs = {p.relative_to(ROOT).as_posix(): p for p in (ROOT / 'packs').rglob('*') if p.is_file()}
    expected = {p for p in final_files if p.startswith('packs/')}
    if set(current_packs) != expected or any(current_packs[p].read_bytes() != final_files[p] for p in expected):
        raise SystemExit('Current packs differ from the final release archive. Resolve before importing.')
    for path in sources:
        final_files[path] = (ROOT / path).read_bytes()
    # Binary fast-import preserves bytes and avoids a subprocess per asset.
    timestamp = int(time.time())
    proc = subprocess.Popen(['git', 'fast-import', '--quiet'], cwd=ROOT, stdin=subprocess.PIPE)
    stream = proc.stdin

    def line(value):
        stream.write(value.encode('utf-8') + b'\n')

    def data(value):
        line(f'data {len(value)}')
        stream.write(value + b'\n')

    for index, (version, files) in enumerate(payloads):
        line('commit refs/heads/main')
        line(f'committer {name} <{email}> {timestamp + index} +0800')
        data(f'release: v{version}' .encode())
        line('deleteall')
        for path, content in sorted(files.items()):
            line('M 100644 inline ' + json.dumps(path, ensure_ascii=True))
            data(content)
        line('')
        line(f'tag v{version}')
        line('from refs/heads/main')
        line(f'tagger {name} <{email}> {timestamp + index} +0800')
        data(f'Food & Table {version}; recovered original release payload'.encode())
        stream.flush()
        print(f'Imported v{version}: {len(files)} files', flush=True)
    line('done')
    stream.close()
    if proc.wait() != 0:
        raise SystemExit('git fast-import failed; inspect repository before retrying.')
    (ROOT / 'RELEASE_SNAPSHOT.json').write_bytes(final_files['RELEASE_SNAPSHOT.json'])
    git('reset', '--mixed', 'main')
    print('Created seven version commits and annotated tags; working files preserved.')


if __name__ == '__main__':
    main()
