/** Hand-authored voxel geometry and pixel palettes. No CDN, AI image service or binary dependencies. */
import { deflateSync } from 'node:zlib';
import {writeOutput} from './fs-output.mjs';
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = (n & 1) ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
export function crc32(bytes) {
  let n = 0xffffffff;
  for (const b of bytes) n = crcTable[(n ^ b) & 255] ^ (n >>> 8);
  return (n ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type), size = Buffer.alloc(4), crc = Buffer.alloc(4);
  size.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([size, name, data, crc]);
}
export function png(width, height, pixels) {
  const head = Buffer.alloc(13); head.writeUInt32BE(width); head.writeUInt32BE(height, 4); head[8] = 8; head[9] = 6;
  const rows = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) Buffer.from(pixels.subarray(y * width * 4, (y + 1) * width * 4)).copy(rows, y * (width * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', head), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}
export const rgb = hex => [1,3,5].map(n => parseInt(hex.slice(n, n + 2), 16));
const noise = (x, y, salt = 0) => ((x * 374761393 + y * 668265263 + salt * 1274126177) ^ ((x + y) * 29)) >>> 0;
export const palette = colors => ['#e4e5db','#78a69b','#986d49','#b3c4c6','#f2ead4','#3f4946',...colors,'#699552','#d6b36c','#4d342a','#d8e6e0'];
export function atlas(colors) {
  const p = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const index = Math.floor(y / 8) * 8 + Math.floor(x / 8), base = rgb(colors[index % colors.length]);
    const shade = ((noise(x, y, index) % 13) - 6) * 1.15;
    const offset = (y * 64 + x) * 4;
    p.set([...base.map(c => Math.max(0, Math.min(255, c + shade))), 255], offset);
  }
  return png(64, 64, p);
}
export function box(x, y, z, w, h, d, color) { return { origin: [x,y,z], size: [w,h,d], color }; }
function ball(cubes, x, y, z, size, color) {
  cubes.push(box(x-size/2, y+size*.2, z-size/2, size, size*.6, size, color));
  cubes.push(box(x-size*.35, y, z-size*.35, size*.7, size, size*.7, color));
}
export function vesselModel(vessel) {
  const a = [];
  if (vessel === 'plate') {
    a.push(box(-5.5,0,-5.5,11,.5,11,0),box(-4.5,.5,-4.5,9,.3,9,4));
    a.push(box(-6,.4,-4,1,.6,8,1),box(5,.4,-4,1,.6,8,1),box(-4,.4,-6,8,.6,1,1),box(-4,.4,5,8,.6,1,1));
    a.push(box(-5,.4,-5,1,.6,1,0),box(4,.4,-5,1,.6,1,0),box(-5,.4,4,1,.6,1,0),box(4,.4,4,1,.6,1,0));
  } else if (vessel === 'bowl') {
    a.push(box(-3,0,-3,6,.75,6,1),box(-4,.75,-4,8,.8,8,0));
    a.push(box(-5,1.5,-4,1.25,3.5,8,0),box(3.75,1.5,-4,1.25,3.5,8,0),box(-4,1.5,-5,8,3.5,1.25,0),box(-4,1.5,3.75,8,3.5,1.25,0));
    a.push(box(-5,4.5,-4,.5,.5,8,1),box(4.5,4.5,-4,.5,.5,8,1),box(-4,4.5,-5,8,.5,.5,1),box(-4,4.5,4.5,8,.5,.5,1));
  } else if (vessel === 'glass') {
    a.push(box(-3,0,-3,6,.6,6,12));
    for (const x of [-3,2.5]) for (const z of [-3,2.5]) a.push(box(x,.6,z,.5,9,.5,12));
    for (const y of [1,9.4]) {
      a.push(box(-3,y,-3,6,.5,.5,12),box(-3,y,2.5,6,.5,.5,12),box(-3,y,-3,.5,.5,6,12),box(2.5,y,-3,.5,.5,6,12));
    }
  } else if (vessel === 'mug') {
    a.push(box(-3.5,0,-3.5,7,.8,7,2),box(-3.5,.8,-3.5,1,7,7,2),box(2.5,.8,-3.5,1,7,7,2),box(-2.5,.8,-3.5,5,7,1,2),box(-2.5,.8,2.5,5,7,1,2));
    a.push(box(3.5,2,-1.5,2,.8,3,2),box(4.8,2,-1.5,.7,4,3,2),box(3.5,5.2,-1.5,2,.8,3,2));
  }
  return a;
}
export function foodModel(food) {
  const a = vesselModel(food.vessel), y = food.vessel === 'bowl' ? 4 : 1;
  const add = (x, yy, z, w, h, d, c = 6) => a.push(box(x,yy,z,w,h,d,c));
  const leaf = (x,z,yy=y+1) => add(x,yy,z,1.7,.3,2,9);
  const stripes = (count, yy, c=6, width=.5, length=7) => {
    for (let i=0;i<count;i++) add(-3.5+i*7/count, yy+(i%3)*.08,-length/2,width,.35,length,c);
  };
  const crumbs = (n, yy, c=8) => { for(let i=0;i<n;i++) add((noise(i,3)%70)/10-3.5,yy,(noise(i,8)%70)/10-3.5,.6,.3,.6,c); };
  switch(food.shape) {
    case 'rice':
      add(-3.7,y,-3.7,7.4,1,7.4); add(-2.8,y+1,-2.8,5.6,.8,5.6); crumbs(18,y+1.9,7); crumbs(8,y+2,9); break;
    case 'diced':
      for(let i=0;i<9;i++) add(-4+(i%3)*2.8,y+(i%2)*.3,-4+Math.floor(i/3)*2.8,2.2,1.8,2.2,i%4===0?7:6);
      leaf(1,-2,y+2); leaf(-3,2,y+2); break;
    case 'tofu':
      add(-3.7,y-.1,-3.7,7.4,.5,7.4,7);
      for(let i=0;i<6;i++) add(-3.3+(i%3)*2.4,y+.4,-2.8+Math.floor(i/3)*3,2,1.6,2,6);
      crumbs(10,y+2.1,9); break;
    case 'braised':
      for(let i=0;i<4;i++){const x=-3.3+(i%2)*3.7,z=-3.3+Math.floor(i/2)*3.7; add(x,y,z,3,2,3,6);add(x,y+1.1,z,3,.5,3,8);add(x,y+1.6,z,3,.6,3,7);} break;
    case 'scramble':
      for(let i=0;i<11;i++) add((i%4)*2-3.8,y+(i%3)*.2,Math.floor(i/4)*2.4-3,1.9,1,1.9,i%2?6:7);leaf(-1,0,y+1.5);break;
    case 'strips': case 'crispy_pork':
      for(let i=0;i<5;i++) add(-4+(i%2)*4,y+i*.2,-3+i*1.3,3.6,.7,2, i%2?7:6);
      for(let i=0;i<4;i++) add(-3+i*1.7,y+1.5,-1+i*.6,.35,.25,3,food.shape==='crispy_pork'?8:9);break;
    case 'noodle': case 'shreds': case 'fine_soup': case 'pasta':
      if(food.vessel==='bowl')add(-3.7,y-.2,-3.7,7.4,.4,7.4,food.shape==='fine_soup'?7:8);
      stripes(food.shape==='fine_soup'?15:10,y+.3,6,food.shape==='fine_soup'?.18:.45);
      if(food.shape==='noodle'){for(let i=0;i<3;i++)add(-3+i*2.2,y+.9,-2+i*1.2,2.5,.6,2,7);leaf(1,1,y+1.6);}
      if(food.shape==='shreds'){for(let i=0;i<3;i++)add(-2+i*2,y+.8,-1,1.4,.6,2.5,7);leaf(0,2,y+1.3);}
      if(food.shape==='fine_soup'){for(let i=0;i<6;i++)add(-3+i,y+.8,-3+i*.5,.2,.15,5,9);}
      if(food.shape==='pasta'){add(-2.5,y+.5,-2.5,5,.9,5,7);crumbs(8,y+1.5,9);}break;
    case 'dumpling':
      for(let i=0;i<5;i++){let x=(i%3)*3.1-3.6,z=Math.floor(i/3)*3.8-2.5;add(x,y,z,2.9,1.5,2.2,6);add(x+.4,y+1.5,z+.3,2.1,.8,1.5,6);for(let j=0;j<3;j++)add(x+.4+j*.65,y+2.3,z+.5,.3,.35,1.1,7);}break;
    case 'sliced_chicken': case 'slices':
      for(let i=0;i<6;i++){add(-4+i*1.25,y,-3+(i%2)*.3,1.1,1.6,5.5,6);add(-4+i*1.25,y+1.6,-3+(i%2)*.3,1.1,.3,5.5,7);}leaf(2,2,y+2);break;
    case 'ribs':
      for(let i=0;i<6;i++){const x=-3.5+(i%3)*2.5,z=-2.8+Math.floor(i/3)*3;add(x,y,z,2,1.3,2.5,6);add(x+.6,y+1.3,z, .8,.3,2.5,4);}crumbs(8,y+1.7,7);break;
    case 'claypot':
      add(-3.7,y,-3.7,7.4,.7,7.4,6);for(let i=0;i<5;i++)add(-3+i*1.2,y+.7,-2.6+i*.4,1, .6,2.5,7);
      add(-1,y+.8,.5,3,.3,3,4);add(0,y+1.1,1.5,1.5,.3,1.5,10);leaf(-3,1,y+1);break;
    case 'meatballs':
      add(-3.7,y-.2,-3.7,7.4,.3,7.4,7);for(const [x,z] of [[-2,-1.5],[2,-1],[0,2]])ball(a,x,y+.3,z,3.6,6);leaf(1,1,y+4);break;
    case 'eel':
      for(let i=0;i<3;i++){add(-4,y+i*.3,-3+i*2.4,5,.7,1.2,6);add(0,y+i*.3,-3+i*2.4,1.2,.7,2,7);add(-1.5,y+i*.3,-2+i*2.4,2,.7,1.1,6);}leaf(-2,0,y+1.8);break;
    case 'fish':
      add(-4,y,-2,8,1.8,4,6);add(-3,y+1.8,-1.5,6,.7,3,7);add(3.5,y+.5,-1.5,1.5,1.4,3,6);
      add(-5.5,y+.3,-3,1.5,1,2.3,6);add(-5.5,y+.3,.7,1.5,1,2.3,6);add(4.3,y+1.9,-1.2,.5,.4,.5,5);
      for(let i=0;i<4;i++)add(-2+i*1.4,y+2.5,-2,.35,.25,4,9);break;
    case 'scallops':
      for(const [x,z]of[[-2.5,-2.4],[2.5,-1.5],[0,2.5]]){
        add(x-1.8,y,z-1.4,3.6,.4,2.8,6);add(x-1.3,y+.4,z-1,2.6,.4,2,7);ball(a,x,y+.7,z,1.6,4);
        for(let k=0;k<4;k++)add(x-1.3+k*.6,y+.5,z-1.3,.2,.2,2.6,8);
      }break;
    case 'prawns':
      for(let i=0;i<3;i++){let x=-3+i*2.9,z=-2+i*.7;add(x,y,z,1.5,1.3,3,6);add(x-1,y,z+2,2,1,1.3,7);add(x-1.3,y,z+1,.8,1,1.5,6);add(x+.3,y+1.3,z,.4,.3,.4,5);}break;
    case 'steak':
      add(-4.5,y,-3,8,2,5.5,6);add(-3.5,y+2,-2.4,6,.3,4.4,7);
      for(let i=0;i<4;i++)add(-3+i*1.6,y+2.3,-2.4,.3,.15,4.4,11);
      for(let i=0;i<3;i++)add(3,y, -3+i*2,1.6,1.2,1.4,10);leaf(-1,3,y+.4);break;
    case 'burger':
      add(-4.3,y,-3.8,8.6,1.6,7.6,6);add(-4,y+1.6,-3.6,8,1.5,7.2,7);add(-4.5,y+3.1,-4,9,.4,8,8);add(-4,y+3.5,-3.7,8,.4,7.4,10);
      add(-4.3,y+3.9,-3.8,8.6,1.4,7.6,6);add(-3.3,y+5.3,-2.8,6.6,.8,5.6,6);crumbs(10,y+6.2,4);break;
    case 'pizza':
      add(-5.5,y,-5.5,11,.7,11,6);add(-4.7,y+.7,-4.7,9.4,.4,9.4,7);
      for(const[x,z]of[[-3,-3],[1,-3],[-1,0],[2,2],[-3,2]])add(x,y+1.1,z,2,.3,2,8);crumbs(12,y+1.5,9);break;
    case 'sandwich':
      for(const z of [-3.5,.5])for(let layer=0;layer<5;layer++)add(-4,y+layer*.7,z,8,.7,3,layer===0||layer===4?6:layer%2?7:8);break;
    case 'roast':
      ball(a,0,y,0,7,6);add(-2,y+5,-2,4,.7,4,7);
      for(const x of [-4.5,2.5]){add(x,y,-3,2.2,2,5,6);add(x+.6,y+1,-4,1,.7,1.6,4);}leaf(-4,3,y+.5);break;
    case 'soup':
      add(-3.7,y,-3.7,7.4,.4,7.4,6);for(let i=0;i<5;i++){add(-3+(i%3)*2.2,y+.5,-2+Math.floor(i/3)*3,1.8,.3,1.6,7);}crumbs(9,y+.9,9);break;
    case 'salad':
      for(let i=0;i<12;i++)add((i%3)*2.3-3.5,y+(i%3)*.4,Math.floor(i/3)*1.7-3.5,2.4,.7,2.2,i%4===0?7:i%3===0?8:6);break;
    case 'buns':
      for(const[x,z]of[[-2.5,-2],[2.2,-1.5],[0,2.5]]){ball(a,x,y,z,3.8,6);add(x-1,y+3.8,z-.3,2,.3,.6,7);add(x-.3,y+3.8,z-1,.6,.3,2,7);}break;
    case 'rolls':
      for(let i=0;i<3;i++){add(-4+i*3,y,-3.3,2.4,1.8,6.6,6);add(-3.5+i*3,y+1.8,-3,1.4,.4,6,7);add(-3.5+i*3,y+.3,3.3,1.4,1, .2,8);}break;
    case 'nuggets':
      for(let i=0;i<6;i++){add(-4+(i%3)*2.7,y+(i%2)*.2,-3+Math.floor(i/3)*3,2.3,1.4,2.5,6);add(-3.7+(i%3)*2.7,y+1.4,-2.7+Math.floor(i/3)*3,1.7,.3,1.9,7);}break;
    case 'fries':
      for(let i=0;i<13;i++)add(-4+(i%6)*1.3,y+Math.floor(i/6)*.6,-3+(i%3)*1.4,.85,.7,4+(i%3),i%3===0?8:i%2?7:6);break;
    case 'hotdog':
      add(-5,y,-2,10,2.4,4,6);add(-4.5,y+2,-1.2,9,1.6,2.4,7);
      for(let i=0;i<7;i++)add(-4+i*1.2,y+3.6,(i%2)*.7-.5,1.2,.3,.5,8);break;
    case 'skewers':
      for(let i=0;i<3;i++){const x=-3+i*3;add(x,y,-5,.4,.4,10,2);for(let j=0;j<3;j++)add(x-.8,y+.4,-3+j*2.7,2,1.4,2,j%2?8:6);}break;
    case 'tea': case 'coffee': case 'milk_tea': case 'shake': case 'juice': case 'chocolate': {
      const glass=food.vessel==='glass', h=glass?8:6.4, w=glass?5:4.8;
      add(-w/2,.8,-w/2,w,h-.8,w,6);
      if(['shake','chocolate'].includes(food.shape)){ball(a,0,h,0,3.8,7);add(.3,h+3,-.3,1,1,1,8);}
      if(glass){add(1.4,h-1,1,.45,4,.45,food.shape==='juice'?9:8);}
      if(food.shape==='milk_tea')for(let i=0;i<4;i++)add(-2+i*1.1,1.5,2.5,.7,.7,.4,8);
      if(food.shape==='tea')add(-1,h,-1,2,.1,.5,7);
      if(food.shape==='coffee')add(-1.5,h,-1,3,.1,.3,7);
      break;
    }
    case 'layer_cake': case 'choc_cake': case 'cheesecake': {
      const height=food.shape==='cheesecake'?4.5:6;
      for(let layer=0;layer<6;layer++)for(let strip=0;strip<4;strip++)add(-3.8+strip,y+layer*height/6,-3+strip*1.6,7.6-strip*2,height/6,1.6,layer===0?8:layer%2?6:7);
      if(food.shape==='layer_cake'){ball(a,.4,y+height,0,1.7,8);leaf(.3,-.3,y+height+1.7);}
      else if(food.shape==='choc_cake')add(-1,y+height,-1,2,.5,2,8);
      else add(-2,y+height,-2.5,4,.2,1.5,7);break;
    }
    case 'pudding':
      add(-3,y,-3,6,1,6,6);add(-2.5,y+1,-2.5,5,2,5,6);add(-2,y+3,-2,4,.6,4,7);add(-1,y+3.6,-1,2,.3,2,8);break;
    case 'ice_cream':
      ball(a,-1.6,y,-1,3.6,6);ball(a,1.6,y,-.5,3.6,7);ball(a,0,y+2.5,1,3.6,6);add(-.2,y+5,-.5,.6,2,.6,8);break;
    case 'donut':
      for(const[x,z,w,d]of[[-4,-4,8,2],[-4,2,8,2],[-4,-2,2,4],[2,-2,2,4]]){add(x,y,z,w,1.6,d,6);add(x,y+1.6,z,w,.4,d,7);}for(let i=0;i<7;i++)add(-3+i,y+2,-3,.4,.3,.8,i%2?8:4);break;
    case 'cookies':
      for(const[x,z]of[[-2.5,-2.5],[2,-2],[0,2.3]]){add(x-1.8,y,z-1.3,3.6,.7,2.6,6);add(x-1.3,y,z-1.8,2.6,.7,3.6,6);for(const[dx,dz]of[[-.8,-.7],[.5,.5],[-.5,.8]])add(x+dx,y+.7,z+dz,.6,.2,.6,7);}break;
    case 'tarts':
      for(const[x,z]of[[-2.5,-2],[2,-1.5],[0,2.5]]){add(x-1.7,y,z-1.7,3.4,1.3,3.4,6);add(x-1.2,y+1.3,z-1.2,2.4,.3,2.4,7);add(x-.6,y+1.6,z-.5,.5,.15,.5,8);}break;
    default: throw new Error(`Missing food model: ${food.shape}`);
  }
  return a;
}
export function cutleryModel(key) {
  if(key==='chopsticks')return [box(-2,.2,-6,.65,.65,12,2),box(1,.2,-6,.65,.65,12,2),box(-2,.85,3,.65,.2,1,1),box(1,.85,3,.65,.2,1,1)];
  if(key==='table_knife')return [box(-.8,.2,-6,1.6,.7,5,2),box(-.6,.2,-1,1.2,.5,7,3),box(.6,.2,0,1,.4,5,3)];
  if(key==='fork')return [box(-.5,.2,-6,1,.6,7,3),box(-1.5,.2,1,3,.6,1.5,3),...[-1.5,-.5,.5,1.5].map(x=>box(x,.2,2.5,.4,.6,3.5,3))];
  return [box(-.5,.2,-6,1,.5,7,3),box(-1.5,.2,1,3,.6,4,3),box(-1,.8,1.5,2,.2,3,12)];
}
export function stationModel(key) {
  const a=[box(-8,0,-8,16,14,16,6),box(-8,14,-8,16,2,16,7),box(-5.96,.3,-8.18,11.92,12,.16,2)];
  if(key==='prep_counter'){a.push(box(-6,16,-4,9,.4,7,2),box(4,16,-5,2,2,2,1),box(-5,6,-8.2,10,.6,.3,3),box(-5,11,-8.2,10,.6,.3,3));}
  if(key==='stove'){for(const[x,z]of[[-4,-4],[4,-4],[-4,4],[4,4]])a.push(box(x-2.5,16,z-2.5,5,.3,5,5),box(x-1.2,16.3,z-1.2,2.4,.2,2.4,8));for(let i=0;i<4;i++)a.push(box(-5+i*3,11,-8.2,1,1,.3,3));}
  if(key==='oven'){a.push(box(-5.8,3,-8.36,11.6,8,.16,5),box(-5,4,-8.54,10,5,.16,8),box(-5,11,-8.98,10,.5,.4,3));}
  if(key==='drink_counter'){a.push(box(-6,16,-5,6,5,5,8),box(-5,17,-5.2,4,2,.3,5),box(1,16,-5,5,1,5,3),box(3,17,-3,1,3,1,3),box(-5,5,-8.2,10,5,.3,1));}
  return a;
}
export function cropModel(crop, age) {
  const a=[],h=2+age*3;
  for(let i=0;i<4;i++){
    const x=(i%2)*5-2.8,z=Math.floor(i/2)*5-2.8;
    a.push(box(x,0,z,.6,h,.6,9),box(x-1.2,h*.45,z-1.2,3,.6,3,9));
    if(age>0)a.push(box(x-1.7,h*.7,z-.7,4,.6,2,1));
    if(age===3){
      if(crop.key==='rice'){a.push(box(x-.5,h,z,1.7,2,.8,6),box(x+1,h-1,z,1,2,.8,6));}
      else if(crop.key==='tea')a.push(box(x-1.8,h,z-1.8,4,1,4,6));
      else if(crop.key==='strawberry')a.push(box(x-.7,1,z+.6,1.5,1.5,1.5,6));
      else a.push(box(x+.2,h*.65,z+.5,1.5,crop.key==='soybean'?2.5:1.5,1.5,6));
    }
  }
  return a;
}
export function geometry(key,cubes) {
  return {format_version:'1.12.0','minecraft:geometry':[{description:{identifier:`geometry.mcpe_food.${key}`,texture_width:64,texture_height:64,visible_bounds_width:2,visible_bounds_height:2.5,visible_bounds_offset:[0,.6,0]},bones:[{name:'root',pivot:[0,0,0],cubes:cubes.map(c=>{
    const uv=[(c.color%8)*8+1,Math.floor(c.color/8)*8+1];
    return {origin:c.origin,size:c.size,uv:Object.fromEntries((c.faces??['north','south','east','west','up','down']).map(face=>[face,{uv,uv_size:[6,6]}]))};
  })}]}]};
}
export function canvas(width,height,bg=[0,0,0,0]) {
  const data=new Uint8Array(width*height*4);for(let i=0;i<width*height;i++)data.set(bg,i*4);
  return {width,height,data};
}
export function rect(target,x,y,w,h,color) {
  for(let yy=Math.max(0,Math.floor(y));yy<Math.min(target.height,y+h);yy++)for(let xx=Math.max(0,Math.floor(x));xx<Math.min(target.width,x+w);xx++)target.data.set(color,(yy*target.width+xx)*4);
}
export function blit(target,source,x,y) {
  for(let yy=0;yy<source.height;yy++)for(let xx=0;xx<source.width;xx++){
    const at=(yy*source.width+xx)*4;if(!source.data[at+3])continue;
    const dx=x+xx,dy=y+yy;if(dx>=0&&dy>=0&&dx<target.width&&dy<target.height)target.data.set(source.data.subarray(at,at+4),(dy*target.width+dx)*4);
  }
}
const FONT={A:'01110100011000111111100011000110001',B:'11110100011000111110100011000111110',C:'01111100001000010000100001000001111',D:'11110100011000110001100011000111110',E:'11111100001000011110100001000011111',F:'11111100001000011110100001000010000',G:'01111100001000010111100011000101111',H:'10001100011000111111100011000110001',I:'11111001000010000100001000010011111',J:'00111000100001000010100101001001100',K:'10001100101010011000101001001010001',L:'10000100001000010000100001000011111',M:'10001110111010110101100011000110001',N:'10001110011010110011100011000110001',O:'01110100011000110001100011000101110',P:'11110100011000111110100001000010000',Q:'01110100011000110001101011001001101',R:'11110100011000111110101001001010001',S:'01111100001000001110000010000111110',T:'11111001000010000100001000010000100',U:'10001100011000110001100011000101110',V:'10001100011000110001100010101000100',W:'10001100011000110101101011101110001',X:'10001100010101000100010101000110001',Y:'10001100010101000100001000010000100',Z:'11111000010001000100010001000011111','0':'01110100011001110101110011000101110','1':'00100011000010000100001000010001110','2':'01110100010000100010001000100011111','3':'11110000010000101110000010000111110','4':'00010001100101010010111110001000010','5':'11111100001000011110000010000111110','6':'01110100001000011110100011000101110','7':'11111000010001000100010000100001000','8':'01110100011000101110100011000101110','9':'01110100011000101111000010000101110','&':'01100100101010001000101011001001101','-':'00000000000000011111000000000000000','.':'00000000000000000000000000110001100',':':'00000011000110000000011000110000000','/':'00001000100001000100010000100010000'};
export function text(target,value,x,y,scale=1,color=[218,225,208,255]) {
  for(const ch of value.toUpperCase()){
    const font=FONT[ch];if(font)for(let i=0;i<35;i++)if(font[i]==='1')rect(target,x+(i%5)*scale,y+Math.floor(i/5)*scale,scale,scale,color);
    x+=6*scale;
  }
}
/** Orthographic CPU rasterizer with a depth buffer: previews use the actual generated cubes. */
export function render(cubes,colors,width=128,height=112,padding=7) {
  const target=canvas(width,height),depth=new Float64Array(width*height).fill(-Infinity);
  const project=([x,y,z])=>[.866*(x-z),.5*(x+z)-y,x+y+z];
  const faces=[];
  for(const cube of cubes){
    const[x,y,z]=cube.origin,[w,h,d]=cube.size;
    const points=[[x,y,z],[x+w,y,z],[x+w,y,z+d],[x,y,z+d],[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]].map(project);
    for(const[indexes,shade]of[[[4,5,6,7],1],[[1,2,6,5],.78],[[2,3,7,6],.88]])faces.push({points:indexes.map(i=>points[i]),color:rgb(colors[cube.color%colors.length]),shade});
  }
  const all=faces.flatMap(f=>f.points),minX=Math.min(...all.map(p=>p[0])),maxX=Math.max(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),maxY=Math.max(...all.map(p=>p[1]));
  const scale=Math.min((width-padding*2)/(maxX-minX||1),(height-padding*2)/(maxY-minY||1));
  const offX=(width-(maxX-minX)*scale)/2-minX*scale,offY=(height-(maxY-minY)*scale)/2-minY*scale;
  for(const face of faces){const v=face.points.map(([x,y,z])=>[x*scale+offX,y*scale+offY,z]);
    for(const ids of [[0,1,2],[0,2,3]]){
      const[a,b,c]=ids.map(i=>v[i]);
      const denominator=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(denominator)<.001)continue;
      for(let yy=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1])));yy<=Math.min(height-1,Math.ceil(Math.max(a[1],b[1],c[1])));yy++)for(let xx=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0])));xx<=Math.min(width-1,Math.ceil(Math.max(a[0],b[0],c[0])));xx++){
        const px=xx+.5,py=yy+.5;
        const u=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/denominator;
        const vv=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/denominator,t=1-u-vv;
        if(u<-.001||vv<-.001||t<-.001)continue;
        const z=u*a[2]+vv*b[2]+t*c[2],at=yy*width+xx;if(z<depth[at])continue;depth[at]=z;
        const n=(noise(xx,yy,Math.floor(z))%7)-3;
        target.data.set([...face.color.map(ch=>Math.max(0,Math.min(255,ch*face.shade+n))),255],at*4);
      }
    }
  }
  return target;
}
export function saveImage(path,image) {
  writeOutput(path,png(image.width,image.height,image.data));
}
