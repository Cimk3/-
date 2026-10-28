/** Offline preview of final electronic panel geometry, including its frame and depth. */
import {readFileSync} from 'node:fs';
import {digitalScreens} from '../.build/scenario-catalog.js';
import {canvas,blit,text,saveImage} from './art.mjs';
import {renderDetail} from './detail-art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
const read=p=>JSON.parse(readFileSync(p)),rp='packs/FoodAndTable_RP';
const client=read(`${rp}/entity/mcpe_food/digital_ad_display.entity.json`)['minecraft:client_entity'].description;
const gallery=canvas(1050,1160,[25,36,35,255]);text(gallery,'FIXED DIGITAL SCREENS / FINAL UV / OFFLINE',18,15,2);
for(const[i,d]of digitalScreens.entries()){
 const g=read(`${rp}/models/entity/mcpe_food/${d.key}.geo.json`)['minecraft:geometry'][0],maps={};
 for(const[slot,alias]of [['food','f'],['ware','w']])maps[slot]=decodeRGBA(readFileSync(`${rp}/${client.textures[alias+i]}.png`));
 blit(gallery,renderDetail(g.bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:b.name,faces:Object.keys(c.uv)}))),maps,330,320,{front:true}),i%3*350+10,Math.floor(i/3)*360+60);
 text(gallery,`${d.brand.toUpperCase()} ${d.width}X${d.height}`,i%3*350+15,Math.floor(i/3)*360+390,1);
}
saveImage('previews/digital_screen_models.png',gallery);
