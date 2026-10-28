import {mkdirSync} from 'node:fs';
/** Original pixel campaigns, inspired by graphic systems rather than copied artwork. */
import {canvas,rect,text,saveImage,blit} from './art.mjs';
import {writeOutput} from './fs-output.mjs';
import {brandAdvertisements} from '../.build/scenario-catalog.js';
export function brandImage(brand,w,h){
 const luna=brand==='luna_studio',ft=brand==='ft_computer',bg=luna?[27,29,58,255]:ft?[226,223,207,255]:[18,54,52,255],ink=luna?[242,220,177,255]:ft?[34,45,56,255]:[220,239,212,255],accent=luna?[157,166,202,255]:ft?[183,75,50,255]:[137,208,167,255],im=canvas(w,h,bg);
 const R=(x,y,ww,hh,c=ink)=>rect(im,Math.round(x),Math.round(y),Math.round(ww),Math.round(hh),c),s=Math.min(w,h),cx=w/2,cy=h*.54;
 text(im,luna?'LUNA STUDIO':ft?'FT COMPUTER':'TEMPLATE AI',12,12,w===128?1:2,ink);
 if(luna){const r=s*.24;for(let y=-r;y<=r;y+=2)for(let x=-r;x<=r;x+=2)if(x*x+y*y<r*r&&(x-r*.5)**2+(y-r*.12)**2>r*r*.86)R(cx+x,cy+y,2,2,ink);for(let i=0;i<15;i++)R(12+(i*43)%(w-24),40+(i*29)%Math.max(12,h-80),2,2,accent);R(cx-s*.3,cy+r+9,s*.6,2,accent);}
 else if(ft){R(cx-s*.34,cy-s*.22,s*.5,s*.36);R(cx-s*.31,cy-s*.19,s*.44,s*.27,bg);R(cx-s*.12,cy+s*.14,s*.06,s*.1);R(cx-s*.23,cy+s*.24,s*.28,s*.025);R(cx+s*.21,cy-s*.21,s*.16,s*.48);for(let i=0;i<7;i++)R(cx+s*.23,cy-s*.16+i*s*.045,s*.12,2,accent);text(im,'FT',Math.round(cx-s*.2),Math.round(cy-s*.1),Math.max(1,Math.floor(s/48)),accent);}
 else{const size=s*.16;for(let i=0;i<6;i++){const x=cx+(i%3-1)*size*1.3,y=cy+(Math.floor(i/3)-.5)*size*1.3;R(x-size/2,y-size/2,size,size,i%2?accent:ink);R(x-size/2+3,y-size/2+3,size-6,size-6,bg);}R(10,h-38,w-20,2,accent);}
 text(im,luna?'CREATE AFTER DARK':ft?'BUILT FOR IDEAS':'IDEAS INTO FORM',12,h-23,1,ink);text(im,'FOOD & TABLE / 07',12,h-11,1,accent);return im;
}
export function brandPosters(){
 mkdirSync('assets/posters/brands',{recursive:true});
 const preview=canvas(1000,370,[25,36,35,255]);
 for(const [i,ad] of brandAdvertisements.entries()){
  const w=ad.aspect==='portrait'?128:256,h=ad.aspect==='wide'?128:256,im=brandImage(ad.key.slice(3),w,h);
  saveImage(`assets/posters/masters/${ad.key}.png`,im);saveImage(`assets/posters/brands/${ad.key}.png`,im);blit(preview,im,i*320+25,40);text(preview,ad.en, i*320+25,320,1);
 }
 saveImage('previews/brand_advertisements.png',preview);
 writeOutput('assets/posters/brands/design.json',JSON.stringify({source:'tools/brand-art.mjs',brands:brandAdvertisements,references:[{url:'https://www.pentagram.com/work/cohere',principle:'Modular graphic identity and expressive shapes'},{url:'https://www.ibm.com/design/language/ibm-logos/rebus/',principle:'Memorable graphic symbols and typography'}],original:true,digitalLayouts:['256x256','256x192'],notes:'Original compositions; no external logo, photograph or artwork copied.'},null,2)+'\n');
}
