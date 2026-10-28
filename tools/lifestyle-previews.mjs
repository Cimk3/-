import {electronics} from '../.build/electronics-catalog.js';import {refrigerators} from '../.build/appliance-catalog.js';
import {readFileSync,appendFileSync} from 'node:fs';import {officeStationery,homeDecor,networkElectronics,newProps} from '../.build/lifestyle-catalog.js';import {canvas,text,blit,saveImage} from './art.mjs';import {renderDetail} from './detail-art.mjs';import {decodeRGBA} from './png-inspect.mjs';
const rp='packs/FoodAndTable_RP',gallery=canvas(1200,1320,[25,36,35,255]);text(gallery,'NETWORK DEVICES / FRONTS AND REARS / ACTUAL UV',20,15,2);
for(const[i,d]of networkElectronics.entries()){
 const c=JSON.parse(readFileSync(`${rp}/models/blocks/mcpe_food/${d.key}.geo.json`))['minecraft:geometry'][0].bones.flatMap(b=>b.cubes??[]),im=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/device_${d.key}.png`)),x=i%3*400,y=Math.floor(i/3)*640+55;
 for(let side=0;side<2;side++)blit(gallery,renderDetail(c,{food:im,ware:im},370,275,{front:!!side}),x+15,y+side*290);text(gallery,d.en.toUpperCase(),x+12,y+575,1);
}
saveImage('previews/network_details.png',gallery);
const detail=canvas(1200,700,[25,36,35,255]);text(detail,'LIFESTYLE DETAILS / ACTUAL UV / OFFLINE',20,15,2);
for(const[i,key]of ['tape_dispenser','ceramic_vase','table_clock','flower_vase'].entries()){
 const c=JSON.parse(readFileSync(`${rp}/models/blocks/mcpe_food/${key}.geo.json`))['minecraft:geometry'][0].bones.flatMap(b=>b.cubes??[]),im=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/lifestyle_${key}.png`));blit(detail,renderDetail(c,{food:im,ware:im},560,280),i%2*600+15,Math.floor(i/2)*320+45);text(detail,key.toUpperCase(),i%2*600+15,Math.floor(i/2)*320+335,1);
}saveImage('previews/lifestyle_details.png',detail);
appendFileSync('docs/CATALOG.md','\n\n## 0.6.0办公、家居与网络设备\n\n'+newProps.map(d=>`- ${d.zh} / ${d.en}：mcpe_food:${d.key}`).join('\n')+'\n\n办公文具8款、居家装饰8款，电子设备总'+(electronics.length+refrigerators.length)+'项。以上新品只通过创造栏或命令取得，无制作配方。\n');
