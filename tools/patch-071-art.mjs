import {disc,pruneFaces} from './detail-art.mjs';
import {canvas,rect,text,png} from './art.mjs';
export function patch071Cubes(key){
 const a=[],put=(x,y,z,w,h,d,c=0)=>{const b={origin:[x,y,z],size:[w,h,d],color:c,material:'ware'};a.push(b);return b;};
 const screen=(x,y,z,w,h,face='south')=>{const b=put(x,y,z,w,h,.06,1);b.uv={[face]:{uv:[0,0],uv_size:[96,56],material_instance:'ware'}};return b;};
 if(key==='supermarket_checkout'){
  put(-7,0,-5.5,14,1.8,11,0);put(-6.6,.3,5.51,13.2,1.2,.15,1);put(-1,.65,5.67,2,.15,.25,2);
  put(-4.7,1.8,-2.7,1,3.5,1,2);put(-7,4.8,-2.8,7.8,5.2,.65,0);screen(-6.6,5.2,-2.08,7,4.4);
  put(3,1.8,-4.6,.5,7.6,.5,2);put(1.4,9.4,-4.8,4,.7,.9,1);const customer=put(1.6,9.5,-4.85,3.6,.45,.04,1);customer.uv={north:{uv:[0,0],uv_size:[96,56],material_instance:'ware'}};
  put(1.1,1.8,-1.5,5.4,.6,5,1);put(1.6,2.41,-1,4.4,.04,4,2);for(let i=0;i<9;i++)put(1.9+i*.4,2.46,.2,.15,.025,1.6,1);
  for(let i=0;i<5;i++)put(-6.2,2.2+i*.35,2,5,.12,.05,2);put(-5,2,3,2.8,.3,1.5,1);for(let i=0;i<3;i++)put(-4.6+i*.7,2.31,3.5,.4,.03,.5,0);
 }else{
  const count={gpu_single_fan:1,gpu_dual_fan:2,gpu_triple_fan:3}[key];if(!count)throw Error('Unknown patch prop '+key);
  const length=4.6*count+1.3,left=-length/2;
  put(left,.3,-2.8,length,.28,5.6,3);put(left-.15,.58,-3,length+.3,.72,6,1);
  for(let i=0;i<12;i++)put(left+.2,.85,-2.8+i*.47,length-.4,.34,.12,2);
  for(let i=0;i<count;i++){
   const x=left+2.9+i*4.6;disc(a,x,1.3,0,2.05,2.05,.22,2,'ware',12);disc(a,x,1.53,0,1.8,1.8,.12,1,'ware',12);
   for(let j=0;j<7;j++){const t=j*2*Math.PI/7,c=put(x+.85*Math.sin(t)-.2,1.66,.85*Math.cos(t)-.55,.4,.09,1.1,4);c.rotation=[0,j*360/7,0];c.pivot=[x,1.7,0];}
   disc(a,x,1.76,0,.43,.43,.12,2,'ware',8);
  }
  put(left-.35,0,-3.1,.25,2.1,6.2,2);for(let i=0;i<3;i++)put(left-.41,.4,-2.3+i*1.7,.06,.8,1.1,1);
  put(left+.7,.3,2.81,Math.min(length-1.4,6),.12,.6,5);for(let i=0;i<10;i++)put(left+.8+i*.3,.44,2.82,.12,.04,.55,2);
  put(length/2-1.1,.4,-3.4,.8,.7,.5,1);for(let i=0;i<3;i++)put(length/2-.95+i*.2,.65,-3.46,.1,.25,.04,2);
 }
 for(const c of a)for(const face of ['north','south','east','west','up','down']){c.uv??={};c.uv[face]??={uv:[98,60+(c.color??0)*10],uv_size:[28,8],material_instance:'ware'};}
 const result=pruneFaces(a);if(result.length>256)throw Error('Patch model budget '+key);return result;
}
export function patch071Texture(key){
 const colors=[[211,218,218,255],[23,29,37,255],[138,150,157,255],[36,83,70,255],[62,71,79,255],[207,165,66,255]],im=canvas(128,128,colors[0]),mer=canvas(128,128,[0,0,185,255]);
 for(let i=0;i<colors.length;i++){rect(im,96,60+i*10,32,10,colors[i]);rect(mer,96,60+i*10,32,10,[i===2||i===5?170:0,0,i===2?90:185,255]);}
 rect(im,0,0,96,56,[15,33,39,255]);text(im,'FT MARKET',5,4,1,[211,231,211,255]);text(im,'TOTAL 128.00',4,42,1,[211,231,211,255]);
 for(let i=0;i<3;i++){rect(im,5,16+i*7,40-i*5,2,[103,179,163,255]);rect(im,68,16+i*7,22,2,[184,216,202,255]);}
 if(key==='supermarket_checkout')rect(mer,0,0,96,56,[0,12,65,255]);
 return{width:128,height:128,pixels:im.data,png:png(128,128,im.data),mer:png(128,128,mer.data)};
}
