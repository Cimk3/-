import {readFileSync,mkdirSync} from 'node:fs';
import {cityAdvertisements} from '../.build/lifestyle-catalog.js';
import {canvas,rect,text,saveImage,blit} from './art.mjs';
import {writeOutput} from './fs-output.mjs';
const labels=JSON.parse(readFileSync('assets/posters/city/labels.json','utf8').replace(/^\uFEFF/,''));
const palettes=[['#142b40','#376680','#efbd70','#dbe8df'],['#222447','#69538e','#df967e','#ede4c7'],['#263d38','#578376','#e5bb77','#f5e8c7'],['#382b44','#86577b','#d39190','#f5e0b3'],['#3a302a','#896b4e','#bb995c','#f1e2bd'],['#25423d','#75997c','#d0a075','#f4dbc4'],['#203f57','#628d9a','#dfbc80','#f0e7c9'],['#3a4040','#899986','#cdb38e','#f1e6cf']];
const rgb=h=>[...h.slice(1).match(/../g).map(v=>parseInt(v,16)),255];
export function cityPosters(){
 const gallery=canvas(1280,760,[25,36,35,255]);text(gallery,'CITY PIXEL ADVERTISEMENTS / ORIGINAL PIXEL ART',18,16,2);
 cityAdvertisements.forEach((ad,i)=>{
  const w=ad.aspect==='portrait'?128:256,h=ad.aspect==='wide'?128:256,im=canvas(w,h,rgb(palettes[i][0])),[bg,mid,accent,ink]=palettes[i].map(rgb),cx=w/2,cy=ad.aspect==='wide'?77:145;
  const R=(x,y,ww,hh,c=mid)=>rect(im,Math.round(x),Math.round(y),Math.round(ww),Math.round(hh),c);
  // Deliberate 2px grid, compact palette and distinct silhouettes per campaign.
  for(let x=8;x<w-8;x+=12)R(x,h-12,6,2,accent);R(7,7,w-14,2,accent);R(7,7,2,h-20,accent);
  switch(i){
   case 0:R(cx-51,cy-26,80,41,ink);R(cx-47,cy-22,72,32,mid);R(cx-5,cy+15,8,10,accent);R(cx-22,cy+25,43,4,ink);R(cx+36,cy-20,19,49,mid);for(let j=0;j<5;j++)R(cx+40,cy-12+j*5,11,2,accent);for(let j=0;j<5;j++)R(cx-40,cy-17+j*5,30+j%2*12,2,ink);break;
   case 1:R(cx-63,cy-14,126,33,mid);R(cx-54,cy-20,32,10,mid);R(cx+24,cy-20,32,10,mid);R(cx-50,cy-5,25,7,ink);R(cx-41,cy-13,7,24,ink);for(const[x,y]of[[34,-5],[46,4],[34,12],[23,4]])R(cx+x,cy+y,6,6,accent);R(cx-13,cy+5,10,10,bg);R(cx+4,cy+5,10,10,bg);break;
   case 2:R(cx-45,cy-23,90,55,mid);R(cx-35,cy-32,28,9,accent);R(cx-12,cy-12,40,37,ink);R(cx-6,cy-6,28,25,bg);R(cx,cy,16,13,accent);R(cx-38,cy-12,17,8,ink);for(let j=0;j<6;j++)R(20+j*15,cy+57,8,18,mid);break;
   case 3:for(let j=0;j<10;j++)R(20+j*9,cy+38-(j%4+1)*12,5,(j%4+1)*12,mid);R(cx-36,cy-32,10,58,ink);R(cx+26,cy-32,10,58,ink);R(cx-26,cy-42,52,10,ink);R(cx-38,cy+1,17,31,accent);R(cx+21,cy+1,17,31,accent);break;
   case 4:R(17,cy-35,94,96,mid);for(let shelf=0;shelf<3;shelf++){R(20,cy-5+shelf*29,88,4,accent);for(let j=0;j<7;j++)R(23+j*12,cy-31+shelf*29,8,25-j%3*4,j%2?ink:accent);}R(42,cy+70,45,4,ink);break;
   case 5:R(cx-24,cy+5,48,43,mid);R(cx-28,cy+1,56,7,accent);for(let j=0;j<7;j++){const x=cx-35+j*12,y=cy-23-j%3*14;R(x+3,y+8,3,50,mid);R(x-4,y,18,12,j%2?accent:ink);R(x+2,y-5,6,22,j%2?accent:ink);R(x+3,y+4,5,5,bg);}break;
   case 6:for(let x=15;x<w-15;x+=3){const mh=15+Math.abs(Math.sin(x*.055))*30;R(x,cy+25-mh,3,mh,mid);const fh=10+Math.abs(Math.sin(x*.04+1))*17;R(x,cy+25-fh,3,fh,accent);}R(195,cy-32,18,18,ink);R(cx-27,cy+26,54,5,ink);break;
   case 7:R(cx-72,cy-57,144,112,mid);R(cx-56,cy-42,43,39,ink);R(cx-53,cy-39,37,33,bg);R(cx+5,cy-9,52,39,accent);R(cx-51,cy+9,49,26,ink);R(cx-62,cy+32,120,8,accent);R(cx-58,cy+40,5,15,ink);R(cx+46,cy+40,5,15,ink);break;
  }
  saveImage(`assets/posters/city/${ad.key}_art.png`,im);
  const rows=labels[ad.zh],left=Math.floor((w-rows[0].length)/2),top=14;rows.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')R(left+x,top+y,1,1,ink);}));
  const words=ad.en.split(' '),lines=[];let line='';for(const word of words){if((line+' '+word).trim().length*6>w-20){lines.push(line);line=word;}else line=(line+' '+word).trim();}lines.push(line);lines.forEach((l,j)=>text(im,l,Math.floor((w-l.length*6)/2),42+j*9,1,accent));
  saveImage(`assets/posters/masters/${ad.key}.png`,im);
  const gx=i%4*320,gy=Math.floor(i/4)*350+55,scale=Math.min(290/w,285/h);for(let y=0;y<Math.round(h*scale);y++)for(let x=0;x<Math.round(w*scale);x++){const p=(Math.floor(y/scale)*w+Math.floor(x/scale))*4;rect(gallery,gx+Math.floor((320-w*scale)/2)+x,gy+y,1,1,Array.from(im.data.subarray(p,p+4)));}text(gallery,ad.key.replace('ad_city_','').toUpperCase(),gx+20,gy+300,1,ink);
 });
 saveImage('previews/city_advertisements.png',gallery);writeOutput('assets/posters/city/layout.json',JSON.stringify({version:'0.6.0',sampling:'nearest-neighbor',palettes,advertisements:cityAdvertisements},null,2)+'\n');
}
