/** Only named electronics may emit, and only inside their screen/LED UV islands. */
import {electronics} from '../.build/electronics-catalog.js';
const devices=new Map(electronics.map(d=>[`device_${d.key}`,d]));
export function emissionIsValid(image,colorKey){
  const device=devices.get(colorKey),closed=device?.pose==='closed';
  const screen=device&&!closed&&['desktop','all_in_one','laptop','tablet','crt'].includes(device.model);
  for(let i=1;i<image.pixels.length;i+=4){
    const value=image.pixels[i];if(value===0)continue;
    if(!device||closed||image.width!==128||image.height!==128||value>24)return false;
    const pixel=(i-1)/4,x=pixel%128,y=Math.floor(pixel/128);
    const led=[4,9,13].some(role=>x>=96+(role%2)*16&&x<112+(role%2)*16&&y>=64+Math.floor(role/2)*8&&y<72+Math.floor(role/2)*8);
    if(!(screen&&x<96&&y<56)&&!led)return false;
  }
  return true;
}
