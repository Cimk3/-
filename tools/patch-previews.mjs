import path from 'node:path';
import {canvas,blit,rect,text,saveImage} from './art.mjs';
import {renderDetail} from './detail-art.mjs';
import {emittedLidAngle} from './device-geometry.mjs';
export function patchPreviews(root,records,electronics){
  const front=canvas(1080,620,[25,36,35,255]);text(front,'ENTITY FRONT / MOUSE ON USER RIGHT',20,16,2,[233,212,166,255]);
  ['desktop_computer','all_in_one_computer'].forEach((key,i)=>{const art=records.get(key);blit(front,renderDetail(art.cubes,art.textures,510,490,{projection:'entity-front'}),i*540+15,70);text(front,key.toUpperCase(),i*540+20,580,1);});saveImage(path.join(root,'previews/device_fronts.png'),front);
  const angleDevices=electronics.filter(d=>d.openAngle),angles=canvas(1480,Math.ceil(angleDevices.length/4)*330+80,[25,36,35,255]);text(angles,'OPEN ANGLE / MEASURED BETWEEN KEYBOARD AND SCREEN',20,16,2,[233,212,166,255]);
  angleDevices.forEach((d,i)=>{const art=records.get(d.key),angle=emittedLidAngle(art.cubes),x=i%4*370,y=Math.floor(i/4)*330+65;blit(angles,renderDetail(art.cubes,art.textures,350,255,{projection:'side'}),x+10,y);text(angles,d.en.toUpperCase(),x+10,y+267,1);text(angles,`${angle.toFixed(1)} DEG`,x+10,y+286,2,[233,212,166,255]);});saveImage(path.join(root,'previews/laptop_angles.png'),angles);
  const screenKeys=['silver_laptop_open','macbook_open','dell_laptop_open','macbook_pro_gpt_open','macbook_air_silver_open','macbook_air_gray_open','thinkbook16_plus_open','mac_studio_set','surface_pro_keyboard'];
  const screens=canvas(1240,Math.ceil(screenKeys.length/2)*395+70,[25,36,35,255]);text(screens,'PRODUCTION SCREEN UV / STATIC DISPLAYS',20,16,2,[233,212,166,255]);
  for(const[key,i]of screenKeys.map((k,i)=>[k,i])){
    const art=records.get(key),image=art.textures.ware,x=i%2*620+22,y=Math.floor(i/2)*395+65;
    rect(screens,x-5,y-5,586,346,[9,15,20,255]);
    for(let yy=0;yy<336;yy++)for(let xx=0;xx<576;xx++){const at=(Math.floor(yy/6)*128+Math.floor(xx/6))*4;screens.data.set(image.pixels.subarray(at,at+4),((y+yy)*screens.width+x+xx)*4);}
    text(screens,key.toUpperCase(),x,y+348,1);
  }
  saveImage(path.join(root,'previews/screen_desktops.png'),screens);
  const sections=canvas(1280,Math.ceil(angleDevices.length/4)*330+65,[25,36,35,255]);text(sections,'LID SECTIONS / SHELL BLUE / SCREEN GOLD / REAL COORDINATES',15,15,2,[233,212,166,255]);
  angleDevices.forEach((d,i)=>{
    const cubes=records.get(d.key).cubes,x=i%4*320,y=Math.floor(i/4)*330+60;
    for(const c of cubes.filter(c=>['lid_shell','screen'].includes(c.tag))){const xx=x+240+c.origin[2]*25,yy=y+245-(c.origin[1]+c.size[1])*25;rect(sections,Math.round(xx),Math.round(yy),Math.max(1,Math.round(c.size[2]*25)),Math.max(1,Math.round(c.size[1]*25)),c.tag==='screen'?[244,201,96,255]:[79,137,175,255]);}
    text(sections,d.key.toUpperCase(),x+5,y+265,1);
  });saveImage(path.join(root,'previews/screen_sections.png'),sections);
}
