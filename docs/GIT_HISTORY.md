# Git 版本历史说明

本仓库在 0.4.3 完成后建立，按保留下来的原始发行包恢复版本提交。提交时间是恢复时间，不伪造历史开发时间。

| 标签 | 提交内容 |
|---|---|
| v0.1.1 | 原始行为包、资源包的全部解压文件 |
| v0.2.0 | 原始行为包、资源包的全部解压文件 |
| v0.3.0 | 原始行为包、资源包的全部解压文件 |
| v0.4.0 | 原始行为包、资源包的全部解压文件 |
| v0.4.1 | 原始行为包、资源包的全部解压文件 |
| v0.4.2 | 原始行为包、资源包的全部解压文件 |
| v0.4.3 | 原始发行包文件，以及当前完整源码、构建工具、测试、美术源文件、说明与预览 |

旧版完整 TypeScript 源码没有留存，因此前六个标签是可加载的发行内容快照，不能当作旧版完整源码。每版根目录的 `RELEASE_SNAPSHOT.json` 记录原始 mcaddon 的 SHA-256、内包文件数和恢复方式；包内文件内容逐字节保留。0.1.0 没有可用原始发行文件，因此没有创建对应提交或标签。

`packs/FoodAndTable_BP` 和 `packs/FoodAndTable_RP` 保留各版实际发行内容。历史版本可以从 GitHub 对应标签下载仓库 ZIP、解压后使用这两个包目录；也可以分别将目录内部文件压缩成 ZIP，改扩展名为 `.mcpack`。不要把外层目录一起压入 mcpack。

从 v0.4.3 起，使用 README 中的命令构建、校验和打包。`dist/`、`node_modules/`、`.build/`、`.cache/` 不入库，避免重复归档和机器缓存进入历史；本地已有发行文件仍然保留。完整图片主图、排版源、预览和包资源均入库。

恢复工具为 `tools/import-release-history.py`，仅允许在没有提交的仓库运行；需要本地 `dist/` 中的七份原始 mcaddon。正常后续更新直接提交修改并创建新版本标签，不再运行恢复工具。

推送目标：<https://github.com/Cimk3/A-Bite-of-Time>，主分支为 `main`。后续发布可使用：

```powershell
git add .
git commit -m "release: v0.5.4"
git tag -a v0.5.4 -m "Food & Table 0.5.4"
git push origin main --follow-tags
```

提交与标签仅记录文件版本，不代表完成 Windows、安卓、灵动视效或真实联机验收；实际验证范围见 `docs/VALIDATION.md`。

从0.5.2开始，GitHub Release同时提供mcaddon、独立mcpack、完整源码ZIP与SHA256SUMS.txt。后续每版均在新仓库发布。
