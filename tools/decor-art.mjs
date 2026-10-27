import {disc,ring,foodCubes,pruneFaces} from './detail-art.mjs';
const cube=(x,y,z,w,h,d,color=0,material='ware')=>({origin:[x,y,z],size:[w,h,d],color,material});
export function trayCubes(){
  const a=[cube(-7.6,.1,-3.2,15.2,.3,6.4)];
  for(const z of[-3.25,3.05])a.push(cube(-7.6,.4,z,15.2,.25,.2,3));
  for(const x of[-7.65,7.4])a.push(cube(x,.4,-3.1,.25,.25,6.2,3));
  for(const x of[-4.6,0,4.6]){disc(a,x,.43,0,2,2,.16,4,'ware',8);ring(a,x,.6,0,1.9,1.9,.15,.15,1,'ware',12);}
  return a;
}
export function paperCupCubes(){
  const a=[];
  for(let j=0;j<4;j++)disc(a,0,j*1.4,0,1.6+j*.2,1.6+j*.2,1.41,0,'ware',10);
  disc(a,0,5.65,0,2.3,2.3,.3,4,'ware',12);ring(a,0,5.92,0,2.15,2.15,.17,.12,4,'ware',16);
  a.push(cube(.6,6.05,.1,.25,2.1,.25,4));
  // A dedicated label island carries the brand wordmark and emblem.
  const label=cube(-1.45,1.8,2.12,2.9,2.5,.04,2);label.brandFace=true;a.push(label);
  return a;
}
/** Voxelized miniatures: retain material roles, greedily merge occupancy cells.
 * Select the finest grid that fits 48 cubes, then scale into one tray plate. */
export function miniature(food){
  const source=foodCubes(food,'plate').filter(c=>c.material==='food');
  let chosen=[];
  for(const resolution of[12,10,8,6,4,3,2]){
    const cells=new Map(),step=10/resolution;
    for(let x=0;x<resolution;x++)for(let y=0;y<resolution;y++)for(let z=0;z<resolution;z++){
      const p=[-5+(x+.5)*step,1+(y+.5)*step,-5+(z+.5)*step];let hit;
      for(const c of source){let q=p;if(c.rotation){q=p.map((v,i)=>v-(c.pivot??c.origin)[i]);for(let axis=2;axis>=0;axis--){const t=-c.rotation[axis]*Math.PI/180,co=Math.cos(t),si=Math.sin(t);if(axis===0)[q[1],q[2]]=[q[1]*co-q[2]*si,q[1]*si+q[2]*co];if(axis===1)[q[0],q[2]]=[q[0]*co+q[2]*si,-q[0]*si+q[2]*co];if(axis===2)[q[0],q[1]]=[q[0]*co-q[1]*si,q[0]*si+q[1]*co];}q=q.map((v,i)=>v+(c.pivot??c.origin)[i]);}
        if(q.every((v,i)=>v>=c.origin[i]-.12&&v<=c.origin[i]+c.size[i]+.12))hit=c.color;
      }if(hit!==undefined)cells.set(`${x},${y},${z}`,hit);
    }
    const result=[];
    for(const[key,color]of cells){const[x,y,z]=key.split(',').map(Number);if(!cells.has(key))continue;let width=1;while(cells.get(`${x+width},${y},${z}`)===color)width++;let depth=1;while(z+depth<resolution&&Array.from({length:width},(_,i)=>cells.get(`${x+i},${y},${z+depth}`)).every(c=>c===color))depth++;
      for(let xx=0;xx<width;xx++)for(let zz=0;zz<depth;zz++)cells.delete(`${x+xx},${y},${z+zz}`);
      result.push(cube((-5+x*step)*.31,.78+y*step*.31,(-5+z*step)*.31,width*step*.31,step*.31,depth*step*.31,color,'food'));
    }
    chosen=result;if(result.length&&result.length<=48)break;
  }
  if(!chosen.length){const c=source[0];if(c)chosen=[cube(-1,.8,-1,2,.5,2,c.color,'food')];}
  return pruneFaces(chosen);
}
