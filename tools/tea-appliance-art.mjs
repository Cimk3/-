import {canvas,png,text,rect} from './art.mjs';
import {disc,ring,pruneFaces,faceUV} from './detail-art.mjs';
const cube=(x,y,z,w,h,d,color=0)=>({origin:[x,y,z],size:[w,h,d],color,material:'ware'});
export function teaTrayCubes(){
  const a=[],put=(...v)=>a.push(cube(...v));
  put(-7,.18,-6,14,.35,12,0);
  for(const x of[-7,6.6])put(x,.53,-6,.4,.35,12,0);
  for(const z of[-6,5.6])put(-6.6,.53,z,13.2,.35,.4,0);
  for(let i=0;i<12;i++)put(-6.25+i*1.1,.535,-5.5,.16,.07,10.6,5);
  for(const x of[-6,5.5])for(const z of[-5,4.5])put(x,0,z,.5,.18,.5,0);
  // A three-layer purple-clay pot, raised lid, spout and loop handle.
  for(let i=0;i<4;i++)disc(a,-3,.6+i*.61,-2,[1.3,1.95,2.05,1.55][i],[1.2,1.7,1.8,1.4][i],.63,2,'ware',12);
  disc(a,-3,3.04,-2,1.6,1.45,.23,2,'ware',12);disc(a,-3,3.28,-2,1.2,1.1,.12,3,'ware',12);disc(a,-3,3.4,-2,.3,.3,.3,2,'ware',6);
  put(-1.4,1.35,-2.4,1.2,.55,.75,2);put(-.3,1.7,-2.35,.65,.45,.65,2);
  for(let i=0;i<12;i++){const t=i*Math.PI/6,n=t+Math.PI/6,x0=-5.05+Math.cos(t)*.7,y0=1.7+Math.sin(t),x1=-5.05+Math.cos(n)*.7,y1=1.7+Math.sin(n),length=Math.hypot(x1-x0,y1-y0),cx=(x0+x1)/2,cy=(y0+y1)/2;a.push({...cube(cx-length/2,cy-.15,-2.2,length+.04,.3,.4,2),rotation:[0,0,Math.atan2(y1-y0,x1-x0)*180/Math.PI],pivot:[cx,cy,-2]});}
  // Fairness pitcher with an actual open rim and visible tea surface.
  disc(a,3.3,.62,-2,1.25,1.25,.2,1,'ware',8);ring(a,3.3,.82,-2,1.4,1.4,1.7,.22,1,'ware',12);disc(a,3.3,1.75,-2,1.12,1.12,.08,4,'ware',8);put(4.5,1.9,-2.2,.55,.25,.6,1);
  for(const x of[-4.8,-1.6,1.6,4.8]){disc(a,x,.62,3.1,.8,.8,.15,1,'ware',6);ring(a,x,.77,3.1,1,1,.9,.18,1,'ware',10);disc(a,x,1.35,3.1,.78,.78,.055,4,'ware',6);}
  const result=pruneFaces(a);if(result.length>256)throw new Error('Tea tray exceeds scene budget');return result;
}
export function refrigeratorCubes(info){
  const h=info.height*16,a=[],put=(...v)=>a.push(cube(...v));
  put(-7.8,0,-7.8,15.6,h,14.2,0);
  if(info.height===2){
    put(-7.55,.25,6.42,7.4,h-.5,.63,1);put(.15,.25,6.42,7.4,h-.5,.63,1);
    for(const x of[-1.15,.8])put(x,h*.34,7.07,.35,h*.27,.65,3);
    put(-5.2,h*.74,7.06,2.7,2,.035,8);
  }else{put(-7.55,.25,6.42,15.1,h-.5,.63,1);put(5.7,5,7.07,.35,6,.65,3);put(-5.7,12,7.06,3.2,1.5,.035,8);}
  put(-6.8,.3,7.07,13.6,.7,.035,4);
  put(-6.8,1,-7.84,13.6,h-2,.035,4);
  // Front controls use their own printed UV island and never emit light.
  for(const c of a)if(c.color===8)c.uv={south:{uv:[0,64],uv_size:[32,32],material_instance:'ware'}};
  if(a.length>256)throw new Error('Refrigerator exceeds complete scene budget');return a;
}
/** Clip the whole model into two 16-high block parts, preserving cropped UVs. */
export function refrigeratorPart(cubes,part){
  const low=part*16,high=low+16,faces=['north','south','east','west','up','down'];
  return cubes.filter(c=>c.origin[1]<high&&c.origin[1]+c.size[1]>low).map(c=>{
    const y=Math.max(low,c.origin[1]),end=Math.min(high,c.origin[1]+c.size[1]);
    const uv=Object.fromEntries(faces.map(name=>{const source=faceUV(c,name),f={...source,uv:[...source.uv],uv_size:[...source.uv_size]};if(!['up','down'].includes(name)){f.uv[1]+=(c.origin[1]+c.size[1]-end)/c.size[1]*source.uv_size[1];f.uv_size[1]*=(end-y)/c.size[1];}return[name,f];}));
    return {...c,origin:[c.origin[0],y-low,c.origin[2]],size:[c.size[0],end-y,c.size[2]],uv,faces:faces.filter(n=>!(n==='up'&&end<c.origin[1]+c.size[1])&&!(n==='down'&&y>c.origin[1]))};
  });
}
export function tableTexture(kind,finish='white'){
  const color=canvas(128,128),mer=canvas(128,128),tea=kind==='tea';
  const body=finish==='rose_gold'?[185,133,117]:finish==='black'?[36,40,46]:[223,226,224];
  const colors=tea?[[90,54,31],[219,216,196],[119,60,40],[151,84,52],[169,133,58],[45,32,24]]:[body,body.map(v=>Math.min(255,v+6)),[25,30,35],[187,192,198],[40,46,52],[20,24,27],[220,224,225],[120,126,135],[24,35,43]];
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    const role=Math.floor(y/32)*4+Math.floor(x/32),base=colors[role%colors.length],grain=tea?Math.sin(y*.5+Math.sin(x*.2))*5:((y*7+x*3)%5)-2;
    const profile=tea?[0,0,role===4?55:role===1?100:205,255]:[role===3?255:finish==='rose_gold'&&role<2?195:0,0,role===3?65:role===8?70:finish==='rose_gold'?105:92,255];
    color.data.set(base.map(v=>Math.max(0,Math.min(255,Math.round(v+grain)))).concat(255),(y*128+x)*4);mer.data.set(profile,(y*128+x)*4);
  }
  if(!tea){text(color,'4 C',5,76,1,[185,211,222,255]);for(let y=34;y<62;y+=3)rect(color,3,y,26,1,[17,22,27,255]);}
  return{width:128,height:128,pixels:color.data,png:png(128,128,color.data),mer:png(128,128,mer.data)};
}
