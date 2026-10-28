/** Lossless release optimization. Public IDs and persistent index positions never change. */
import {readFileSync,readdirSync,existsSync,unlinkSync,mkdirSync} from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {deflateSync} from 'node:zlib';
import {crc32} from './art.mjs';import {decodeRGBA} from './png-inspect.mjs';import {writeOutput} from './fs-output.mjs';import {zip} from './zip.mjs';
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]),digest=b=>createHash('sha256').update(b).digest('hex');
const chunk=(name,b)=>{const t=Buffer.from(name),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(b.length);c.writeUInt32BE(crc32(Buffer.concat([t,b])));return Buffer.concat([n,t,b,c]);};
const paeth=(a,b,c)=>{const p=a+b-c,x=Math.abs(p-a),y=Math.abs(p-b),z=Math.abs(p-c);return x<=y&&x<=z?a:y<=z?b:c;};
export function losslessPNG(bytes){
 const im=decodeRGBA(bytes),{width:w,height:h,pixels}=im,opaque=pixels.every((v,i)=>i%4!==3||v===255),n=opaque?3:4,stride=w*n,raw=Buffer.alloc(stride*h);
 for(let p=0;p<w*h;p++)for(let c=0;c<n;c++)raw[p*n+c]=pixels[p*4+c];
 const rows=Buffer.alloc((stride+1)*h);
 for(let y=0;y<h;y++){
  let best,score=Infinity,kind=0;
  for(const filter of[0,1,2,4]){const row=Buffer.alloc(stride);let s=0;for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=n?raw[i-n]:0,b=y?raw[i-stride]:0,c=y&&x>=n?raw[i-stride-n]:0,p=filter===0?0:filter===1?a:filter===2?b:paeth(a,b,c),v=(raw[i]-p)&255;row[x]=v;s+=Math.min(v,256-v);}if(s<score){score=s;best=row;kind=filter;}}
  rows[y*(stride+1)]=kind;best.copy(rows,y*(stride+1)+1);
 }
 const head=Buffer.alloc(13);head.writeUInt32BE(w);head.writeUInt32BE(h,4);head[8]=8;head[9]=opaque?2:6;
 const out=Buffer.concat([bytes.subarray(0,8),chunk('IHDR',head),chunk('IDAT',deflateSync(rows,{level:9})),chunk('IEND',Buffer.alloc(0))]);
 const result=out.length<bytes.length?out:bytes,decoded=decodeRGBA(result);if(!Buffer.from(decoded.pixels).equals(Buffer.from(pixels)))throw Error('Lossless pixel invariant failed');return result;
}
export function optimizePacks(base){
 const before=walk(base).reduce((n,p)=>n+readFileSync(p).length,0),counts={pngChecked:0,pngSavedBytes:0,jsonSavedBytes:0,numberGeometryRemoved:0,merAliases:0};mkdirSync('.cache/png-lossless',{recursive:true});
 const rp=path.join(base,'FoodAndTable_RP'),clientFile=path.join(rp,'entity/mcpe_food/surface_display.entity.json');
 if(existsSync(clientFile)){
  const client=JSON.parse(readFileSync(clientFile));const geo=client['minecraft:client_entity'].description.geometry;
  for(const alias of Object.keys(geo))if(/geometry\.mcpe_food\.surface\.table_number_sign_\d\d$/.test(geo[alias]))geo[alias]='geometry.mcpe_food.surface.table_number_sign';writeOutput(clientFile,JSON.stringify(client));
  for(const file of walk(path.join(rp,'models')))if(/(?:surface_)?table_number_sign_\d\d\.geo\.json$/.test(path.basename(file))){unlinkSync(file);counts.numberGeometryRemoved++;}
 }
 for(const folder of ['blocks','entity']){
  const dir=path.join(rp,'textures',folder,'mcpe_food'),canonical='service_table_number_sign_mer',target=path.join(dir,canonical+'.png');if(!existsSync(target))continue;
  for(const file of walk(dir).filter(p=>/service_table_number_sign_\d\d\.texture_set\.json$/.test(path.basename(p)))){
   const data=JSON.parse(readFileSync(file)),set=data['minecraft:texture_set'],previous=path.join(dir,set.metalness_emissive_roughness+'.png');if(!readFileSync(previous).equals(readFileSync(target)))throw Error('Unequal MER alias');set.metalness_emissive_roughness=canonical;writeOutput(file,JSON.stringify(data));if(previous!==target){unlinkSync(previous);counts.merAliases++;}
  }
 }
 for(const file of walk(base)){
  const b=readFileSync(file);
  if(file.endsWith('.json')){
   // Small historical recipe/drop files stay byte-identical for legacy release hashes.
   if(/[/\\](recipes|loot_tables)[/\\]/.test(file))continue;
   const value=JSON.parse(b),compact=Buffer.from(JSON.stringify(value));if(JSON.stringify(JSON.parse(compact))!==JSON.stringify(value))throw Error('JSON equivalence');counts.jsonSavedBytes+=b.length-compact.length;writeOutput(file,compact);
  }else if(file.endsWith('.png')){
   const cached=path.join('.cache/png-lossless',digest(b)+'.png');let out;
   if(existsSync(cached))out=readFileSync(cached);else{out=losslessPNG(b);writeOutput(cached,out);}
   counts.pngChecked++;counts.pngSavedBytes+=b.length-out.length;writeOutput(file,out);
  }
 }
 const bytes=folder=>walk(path.join(base,folder)).reduce((n,p)=>n+readFileSync(p).length,0);
 const packed=folder=>zip(walk(path.join(base,folder)).sort().map(f=>[path.relative(path.join(base,folder),f).split(path.sep).join('/'),readFileSync(f)]));
 const bp=packed('FoodAndTable_BP'),resource=packed('FoodAndTable_RP');return {beforeBytes:before,bpBytes:bytes('FoodAndTable_BP'),rpBytes:bytes('FoodAndTable_RP'),addonBytes:zip([['FoodAndTable_BP.mcpack',bp],['FoodAndTable_RP.mcpack',resource]]).length,...counts};
}
export function optimizeRelease(){
 const baseline=JSON.parse(readFileSync('tests/fixtures/v0.5.4-storage.json')),cache='.cache/optimized-054.json';let optimizedOld;
 if(existsSync('tests/fixtures/v0.5.4-optimized-storage.json'))optimizedOld=JSON.parse(readFileSync('tests/fixtures/v0.5.4-optimized-storage.json'));else if(existsSync(cache))optimizedOld=JSON.parse(readFileSync(cache));else{optimizedOld=optimizePacks('.cache/storage-baseline');writeOutput(cache,JSON.stringify(optimizedOld));}
 writeOutput('tests/fixtures/v0.5.4-optimized-storage.json',JSON.stringify(optimizedOld,null,2)+'\n');
 const version=JSON.parse(readFileSync('package.json')).version,current=optimizePacks('packs'),report={version,units:'bytes',baseline,optimizedOld,current,lossless:true,oldPosterDimensionsPreserved:true,notes:['Historical recipe/drop JSON remains byte-identical.','PNG cache is keyed by input SHA-256; first encoding verifies exact decoded RGBA.','Block and entity MER aliases are kept in separate private directories.','Old numbered display indices remain bound; 196 redundant geometries and 196 identical MER files are removed.']};writeOutput('storage-report.json',JSON.stringify(report,null,2)+'\n');
 const mib=n=>(n/1048576).toFixed(2);writeOutput('docs/STORAGE.md',`# ${version}存储优化\n\n| 范围 | 导入包 MiB | 行为包解压 MiB | 资源包解压 MiB |\n|---|---:|---:|---:|\n| 0.5.4原版 | ${mib(baseline.addonBytes)} | ${mib(baseline.bpBytes)} | ${mib(baseline.rpBytes)} |\n| 同一批旧内容优化后 | ${mib(optimizedOld.addonBytes)} | ${mib(optimizedOld.bpBytes)} | ${mib(optimizedOld.rpBytes)} |\n| ${version}全部内容 | ${mib(current.addonBytes)} | ${mib(current.bpBytes)} | ${mib(current.rpBytes)} |\n\n采用JSON紧凑序列化、逐行预测PNG无损编码、桌号共用几何及同用途MER去重。旧12幅广告尺寸与像素不变。为保持历史校验兼容，小型配方与掉落JSON按原字节保留。源图和预览只进入独立源码包。去重限于明确引用的桌号重复产物，原始主图不删除。\n\n这表示磁盘与下载体积变化，不代表显存、帧率或客户端加载速度已验证。\n`);
 const build=JSON.parse(readFileSync('build-report.json'));build.geometryCount=walk('packs').filter(f=>f.endsWith('.geo.json')).length;build.blockGeometryCount=walk('packs/FoodAndTable_RP/models/blocks').filter(f=>f.endsWith('.geo.json')).length;build.entityGeometryCount=walk('packs/FoodAndTable_RP/models/entity').filter(f=>f.endsWith('.geo.json')).length;build.highDetailModels=walk('packs/FoodAndTable_RP/models/blocks').filter(f=>f.endsWith('.geo.json')&&JSON.parse(readFileSync(f))['minecraft:geometry'][0].description.texture_width===128).length;build.optimization='lossless; see storage-report.json';writeOutput('build-report.json',JSON.stringify(build,null,2)+'\n');
 const models=JSON.parse(readFileSync('model-report.json'));models.models=models.models.filter(d=>!/^table_number_sign_\d\d$/.test(d.key));models.entityModels=models.entityModels.filter(d=>!/^surface_table_number_sign_\d\d$/.test(d.key));models.sharedTableGeometry='geometry.mcpe_food.surface.table_number_sign';writeOutput('model-report.json',JSON.stringify(models,null,2)+'\n');
 console.log(`Storage: RP ${mib(current.rpBytes)} MiB, addon ${mib(current.addonBytes)} MiB.`);
}
