import {readFileSync} from 'node:fs';
const labels=JSON.parse(readFileSync(new URL('../assets/restaurant/labels.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
import {canvas,rect,text,png} from './art.mjs';
import {disc,pruneFaces} from './detail-art.mjs';
export function serviceCubes(key){
 const a=[],uv=(u,v,w,h)=>({uv:[u,v],uv_size:[w,h],material_instance:'ware'});
 const put=(x,y,z,w,h,d,role=0)=>{const c={origin:[x,y,z],size:[w,h,d],color:role,material:'ware',uv:Object.fromEntries(['north','south','east','west','up','down'].map(f=>[f,uv(96,role*12,30,10)]))};a.push(c);return c;};
 const panel=(x,y,z,w,h,d=.08)=>{const c=put(x,y,z,w,h,d);c.uv.south=uv(0,0,96,56);c.uv.north=uv(0,0,96,56);return c;};
 if(key==='touchscreen_register'){
  put(-6,0,-5,12,1.8,10);put(-5.7,.2,5.02,11.4,1.3,.12,1);put(-.8,.6,5.15,1.6,.15,.16,2);
  put(-3,1.8,-2,6,.3,4,1);put(-.8,2.1,-1,1.6,3.8,1.2,2);
  // A continuous stepped tilt with shared boundaries, clear screen depth.
  for(let i=0;i<20;i++){const z=-2-i*.075,y=5+i*.25;put(-5,y,z,10,.25,.5);const c=put(-4.6,y+.01,z+.54,9.2,.24,.09);c.uv.south=uv(0,56-(i+1)*2.8,96,2.8);c.uv.up=uv(0,56-(i+1)*2.8,96,.001);}
 }else if(key==='payment_scanner'){
  put(-3,0,-3,6,.5,6,3);put(-2.4,.5,-2.1,4.8,5.5,3.9,3);panel(-2,1.2,1.83,4,3.8);put(-1.7,5.3,1.84,3.4,.3,.08,4);
 }else if(key==='receipt_printer'){
  put(-3.5,0,-3.5,7,4.2,7);put(-3.2,4.2,-3.2,6.4,.4,6.4,1);put(-2.8,2,3.52,5.6,.35,.08,1);
  const paper=panel(-2.2,.9,3.62,4.4,1.2);paper.uv.south=uv(0,0,96,56);
  const out=put(-2.2,.85,3.7,4.4,.04,2,3);out.uv.up=uv(0,0,96,56);put(2,3.6,3.53,.5,.3,.08,4);
 }else if(key==='table_number_sign'||key.startsWith('table_number_sign_')||key==='menu_stand'||key==='reserved_sign'){
  const menu=key==='menu_stand',w=menu?8:9,h=menu?10:5;put(-w/2-.5,0,-2,w+1,.45,4,menu?5:0);put(-w/2,.45,-.3,w,h,.6,menu?5:2);panel(-w/2+.25,.7,-.38,w-.5,h-.5,.76);
 }else if(key==='service_bell'){
  for(const [y,r,h] of [[0,3.8,.4],[.4,3.1,.4],[.8,2.8,.8],[1.6,2.3,.7],[2.3,1.5,.4],[2.7,.6,.3]]){const start=a.length;disc(a,0,y,0,r,r,h,y===0?0:2,'ware',16);for(const c of a.slice(start))c.uv=Object.fromEntries(['north','south','east','west','up','down'].map(f=>[f,uv(96,(y===0?0:2)*12,30,10)]));}
 }else if(key==='tissue_box'){
  put(-4.5,0,-3,9,3,6,3);put(-4.6,3,-3.1,9.2,.3,6.2,5);put(-2,3.31,-.45,4,.03,.9,0);put(-1.7,3.35,-.2,3.4,1.4,.12,3);put(-1.4,4.75,-.17,2.8,.65,.12,3);
 }
 return pruneFaces(a);
}
export function serviceTexture(key,number=8){
 const color=canvas(128,128,[27,30,34,255]),mer=canvas(128,128,[0,0,180,255]);
 const colors=[[27,30,34],[65,69,73],[185,148,67],[238,232,215],[68,170,137],[79,50,32]];
 colors.forEach((c,i)=>{rect(color,96,i*12,32,12,[...c,255]);rect(mer,96,i*12,32,12,[i===2?225:0,i===4&&['payment_scanner','receipt_printer'].includes(key)?14:0,i===2?70:170,255]);});
 for(let y=60;y<72;y++)for(let x=96;x<128;x++)if((x+y)%7===0)rect(color,x,y,1,1,[99,66,44,255]);
 const chinese=(word,x,y,c)=>labels[word].forEach((row,dy)=>[...row].forEach((v,dx)=>{if(v==='1')rect(color,x+dx,y+dy,1,1,c);}));
 const ink=[39,43,49,255],gold=[197,159,77,255],paper=[242,236,218,255];rect(color,0,0,96,56,paper);
 if(key==='touchscreen_register'){
  rect(color,0,0,96,56,[21,31,43,255]);rect(color,0,0,96,9,[37,105,98,255]);text(color,'FOOD & TABLE',3,1,1,paper);
  for(let i=0;i<6;i++){rect(color,3+i%3*19,13+Math.floor(i/3)*18,16,15,[78+i*12,106+i*7,91,255]);text(color,String(i+1),8+i%3*19,17+Math.floor(i/3)*18,1,paper);}
  for(let i=0;i<4;i++){rect(color,63,15+i*7,29,1,[142,166,170,255]);}text(color,'128.00',59,45,1,gold);rect(mer,0,0,96,56,[0,16,65,255]);
 }else if(key==='payment_scanner'){
  rect(color,0,0,96,56,[12,24,28,255]);text(color,'WELCOME',21,3,1,paper);for(let i=0;i<5;i++)rect(color,22+i*10,18,5,19,[71+i*20,139,147,255]);text(color,'DISPLAY',22,43,1,paper);rect(mer,0,0,96,56,[0,12,75,255]);
 }else if(key==='receipt_printer'){
  text(color,'FOOD & TABLE',4,2,1,ink);text(color,'ORDER 008',12,13,1,ink);for(let i=0;i<4;i++){text(color,['TEA  12','MEAL 68','CAKE 28','TOTAL 108'][i],10,24+i*7,1,ink);}
 }else if(key.startsWith('table_number_sign')){
  text(color,'TABLE',33,2,1,ink);text(color,String(number).padStart(2,'0'),25,16,4,ink);rect(color,10,51,76,2,gold);
 }else if(key==='menu_stand'){
  chinese('菜单',35,0,ink);['中餐','西餐','日料','甜品','饮品'].forEach((s,i)=>{chinese(s,5,10+i*9,ink);text(color,['CHINESE','WESTERN','JAPANESE','DESSERT','DRINKS'][i],34,13+i*9,1,ink);});
 }else if(key==='reserved_sign'){
  rect(color,0,0,96,56,[96,24,44,255]);rect(color,3,3,90,1,gold);rect(color,3,52,90,1,gold);chinese('已预约',30,10,paper);text(color,'RESERVED',24,34,1,paper);
 }
 return {width:128,height:128,pixels:color.data,png:png(128,128,color.data),mer:png(128,128,mer.data)};
}
