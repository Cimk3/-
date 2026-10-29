/** Final-resource previews. Deliberately do not claim to emulate Bedrock body rotation. */
import {readFileSync} from 'node:fs';
import {canvas,blit,text,saveImage} from './art.mjs';
import {decodeRGBA} from './png-inspect.mjs';
import {renderDetail} from './detail-art.mjs';
import {clothingVisuals,clothingItems} from '../.build/patch-072-catalog.js';
const rp='packs/FoodAndTable_RP',read=p=>JSON.parse(readFileSync(p,'utf8'));
const image=key=>decodeRGBA(readFileSync(`${rp}/textures/entity/mcpe_food/${key}.png`));
function mesh(key,material){const g=read(`${rp}/models/entity/mcpe_food/${key}.geo.json`)['minecraft:geometry'][0];return g.bones.flatMap(b=>(b.cubes??[]).map(c=>({...c,material:material??b.name,faces:Object.keys(c.uv)})));}
export function patch072Previews(){
 const sheet=canvas(1200,520,[25,36,35,255]);text(sheet,'FINAL RACK + CLOTHING / ACTUAL UV / OFFLINE ONLY',18,16,2);
 const configs=[['single_clothing_rail','hanging',['display_shirt','display_suit_navy']],['double_clothing_shelf','folded',['display_tshirt','display_hat','display_coat','display_suit_light_gray']],['mannequin_display','mannequin',['display_suit_black']]];
 configs.forEach(([key,pose,clothes],i)=>{const cs=mesh('surface_'+key,'base'),maps={base:image('patch072_'+key)};clothes.forEach((item,slot)=>{const v=clothingVisuals.find(v=>v.key===item&&v.pose===pose&&v.slot===slot),mat='cloth'+slot;cs.push(...mesh('garment_'+v.visualKey,mat));maps[mat]=image('patch072_'+item);});blit(sheet,renderDetail(cs,maps,380,430,{front:true}),i*400+10,55);text(sheet,key.toUpperCase(),i*400+12,493,1);});saveImage('previews/patch_072_clothing_racks.png',sheet);
 const clothesSheet=canvas(900,980,[25,36,35,255]);text(clothesSheet,'0.7.2 CLOTHING / FINAL UV / RACK CONTENT ONLY',18,16,2);
 clothingItems.forEach((d,i)=>{const v=clothingVisuals.find(v=>v.key===d.key&&v.pose==='mannequin'),cs=mesh('garment_'+v.visualKey,'ware');blit(clothesSheet,renderDetail(cs,{ware:image('patch072_'+d.key)},285,265,{front:true}),i%3*300+7,65+Math.floor(i/3)*300);text(clothesSheet,d.en.toUpperCase(),i%3*300+8,345+Math.floor(i/3)*300,1);});saveImage('previews/patch_072_clothing.png',clothesSheet);
 const panels=canvas(1200,480,[25,36,35,255]);text(panels,'DIRECTIONAL FACES / FINAL GEOMETRY / NOT A GAME SCREENSHOT',15,15,2);
 const client=read(`${rp}/entity/mcpe_food/digital_ad_display.entity.json`)['minecraft:client_entity'].description;
 ['platform_information_screen','government_queue_screen'].forEach((key,i)=>{const cs=mesh(key),idx=9+i,maps={food:decodeRGBA(readFileSync(`${rp}/${client.textures['f'+idx]}.png`)),ware:decodeRGBA(readFileSync(`${rp}/${client.textures['w'+idx]}.png`))};blit(panels,renderDetail(cs,maps,390,350,{front:true}),i*400+5,60);text(panels,key.toUpperCase()+' 2X1',i*400+8,440,1);});blit(panels,renderDetail(mesh('surface_supermarket_checkout','ware'),{ware:image('patch071_supermarket_checkout')},390,350,{front:true}),805,60);text(panels,'CHECKOUT / CASHIER FRONT',810,440,1);saveImage('previews/patch_072_facing.png',panels);
}
