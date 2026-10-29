/** Original 6:5 pixel campaigns drawn independently at their native resolution. */
import {canvas,rect,text} from './art.mjs';
export function largeAdImage(brand){
 const w=384,h=320,apple=brand==='apple',bg=apple?[241,242,240,255]:[24,34,47,255],ink=apple?[39,42,45,255]:[238,239,226,255],accent=apple?[160,170,177,255]:[228,104,69,255],im=canvas(w,h,bg);
 if(apple){
  // Geometric apple mark, redrawn for this original composition.
  for(let y=0;y<42;y++)for(let x=0;x<44;x++){
   const left=((x-15)/14)**2+((y-21)/18)**2<1,right=((x-29)/14)**2+((y-21)/18)**2<1,bite=((x-40)/7)**2+((y-13)/7)**2<1;
   if((left||right)&&!bite)rect(im,34+x,30+y,1,1,ink);
  }
  rect(im,56,26,8,3,ink);rect(im,60,22,7,4,ink);
  text(im,'APPLE',96,45,3,ink);text(im,'CREATED FOR WHAT IS NEXT',36,96,1,[91,101,108,255]);
  rect(im,104,128,176,102,[89,99,107,255]);rect(im,109,133,166,91,[221,227,229,255]);rect(im,117,141,150,75,[181,196,203,255]);rect(im,130,150,123,56,[200,213,218,255]);rect(im,174,230,35,16,accent);rect(im,148,246,87,5,[110,119,126,255]);
  text(im,'LESS, BUT BETTER',118,278,1,ink);
 }else{
  text(im,'FT COMPUTER',25,24,3,ink);rect(im,25,63,55,4,accent);text(im,'BUILT FOR IDEAS',25,79,2,[182,200,208,255]);
  rect(im,30,126,213,124,[171,187,191,255]);rect(im,35,131,203,114,[44,62,79,255]);rect(im,46,142,181,92,[69,103,118,255]);rect(im,58,153,157,70,[118,156,160,255]);text(im,'FT',108,173,4,ink);rect(im,119,250,34,19,[171,187,191,255]);rect(im,90,269,92,5,[171,187,191,255]);
  rect(im,266,136,86,133,[72,86,97,255]);rect(im,273,143,72,119,[39,51,63,255]);for(let i=0;i<8;i++)rect(im,282,156+i*9,52,3,accent);text(im,'FT',291,241,2,ink);text(im,'FOOD & TABLE',25,300,1,[182,200,208,255]);
 }
 return im;
}
