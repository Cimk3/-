import {readFileSync,appendFileSync} from 'node:fs';
import {restaurantItems,restaurantAccessories} from '../.build/restaurant-catalog.js';
import {canvas,text,blit,saveImage} from './art.mjs';
import {renderDetail} from './detail-art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
const rp='packs/FoodAndTable_RP',image=canvas(1200,1040,[25,36,35,255]);text(image,'SIGN FRONTS AND BACKS / PRODUCTION UV',20,15,2);
for(const [row,key]of ['table_number_sign','menu_stand','reserved_sign'].entries()){
 const geo=JSON.parse(readFileSync(`${rp}/models/blocks/mcpe_food/${key}.geo.json`))['minecraft:geometry'][0],cubes=geo.bones.flatMap(b=>b.cubes??[]),texture=decodeRGBA(readFileSync(`${rp}/textures/blocks/mcpe_food/service_${key}.png`));
 for(let i=0;i<2;i++)blit(image,renderDetail(cubes,{ware:texture,food:texture},550,290,{front:!!i}),i*600+25,row*330+55);
 text(image,key.toUpperCase(),20,row*330+345,1);
}
saveImage('previews/restaurant_signs.png',image);
const target='docs/CATALOG.md',content=readFileSync(target,'utf8');if(!content.includes('## 餐厅用品（0.5.4）'))appendFileSync(target,'\n\n## 餐厅用品（0.5.4）\n\n'+restaurantItems.map(d=>`- ${d.zh} / ${d.en}：mcpe_food:${d.key}`).join('\n')+'\n\n桌号仅一个创造物品，空手设置01—99；默认08，收回重放重置。其余物品静态。电子设备35项，餐厅用品5项。\n');

