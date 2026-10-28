import {canvas,rect,text,png} from './art.mjs';
import {disc,ring,pruneFaces} from './detail-art.mjs';
const faces=['north','south','east','west','up','down'];
const uv=(u,v,w,h)=>({uv:[u,v],uv_size:[w,h],material_instance:'ware'});
export function lifestyleCubes(key){
 const a=[],put=(x,y,z,w,h,d,color=0)=>{const c={origin:[x,y,z],size:[w,h,d],color,material:'ware'};a.push(c);return c;};
 const round=(x,y,z,r,h,c=0)=>disc(a,x,y,z,r,r,h,c,'ware',12);
 const hoop=(x,y,z,r,h,t,c=0)=>ring(a,x,y,z,r,r,h,t,c,'ware',12);
 const face=(c,name='south')=>{c.uv={[name]:uv(0,0,96,56)};return c;};
 switch(key){
 case 'pen_holder':round(0,0,0,2.7,.3);hoop(0,.3,0,2.6,4,.25);for(let i=0;i<6;i++){put(-1.8+i*.65,.4,-.8+i%2*1.4,.35,5.5+i%3*.6,.35,4+i%3);put(-1.8+i*.65,5.9+i%3*.6,-.8+i%2*1.4,.35,.3,.35,2);}break;
 case 'notebook_open':put(-6,0,-4.2,12,.25,8.4,7);face(put(-5.8,.25,-4,5.5,.35,8,3),'up');face(put(.3,.25,-4,5.5,.35,8,3),'up');put(-.1,.28,-4.1,.2,.35,8.5,5);put(2,.61,2.7,.5,.025,2,4);break;
 case 'notebook_closed':put(-4,0,-5,8,.6,10,7);put(-3.8,.15,-4.8,7.6,.35,9.6,3);put(-4,.6,-5,8,.15,10,7);put(2.4,.76,-5,.4,.04,10,0);break;
 case 'document_stack':for(let i=0;i<8;i++){put(-4.5+i%2*.12,i*.17,-3.5,9,.14,7,3);put(3.7,i*.17+.02,-2+i%4,1.2,.09,.5,4+i%3);}face(put(-4.3,1.36,-3.3,8.6,.02,6.6,3),'up');break;
 case 'standing_binder':put(-3,0,-2,6,8,.5,7);put(-3,0,1.5,6,8,.5,7);put(-3,0,-1.5,.6,8,3,7);put(-2.4,.4,-1.45,5.2,7.2,2.9,3);face(put(-3.02,2,-1.2,.025,4,2.4,3),'west');break;
 case 'stapler':put(-2,0,-4,4,.4,8,2);put(-1.7,.4,-3.7,3.4,.3,7.4,0);put(-1.5,.7,-3.5,3,1.7,2,2);put(-1.8,2.4,-3.5,3.6,.6,7.5,0);break;
 case 'tape_dispenser':put(-2.4,0,-3.5,4.8,.55,7,0);for(const x of[-2.4,1.9])put(x,.55,-3.5,.5,.8,3.8,0);for(let i=0;i<20;i++){const t=i*Math.PI/10,n=t+Math.PI/10,y=2.1+Math.cos(t)*1.25,z=-1.5+Math.sin(t)*1.25,yy=2.1+Math.cos(n)*1.25,zz=-1.5+Math.sin(n)*1.25,len=Math.hypot(yy-y,zz-z);const c=put(-1.8,(y+yy)/2-len/2,(z+zz)/2-.18,3.6,len+.02,.36,8);c.rotation=[Math.atan2(zz-z,yy-y)*180/Math.PI,0,0];c.pivot=[0,(y+yy)/2,(z+zz)/2];}put(-1.8,1,2,3.6,.15,1.3,8);for(let i=0;i<8;i++)put(-1.8+i*.45,1.16,3,.3,.15,.4,2);break;
 case 'desk_organizer':for(const y of[0,3]){put(-6,y,-4,12,.3,8,5);put(-6,y+.3,-4,.35,1.2,8,5);put(5.65,y+.3,-4,.35,1.2,8,5);put(-5.65,y+.3,-4,11.3,1.2,.3,5);for(let i=0;i<3;i++)put(-5.2,y+.35+i*.15,-3.3,10.4,.12,6.3,3);}for(const x of[-6,5.65])put(x,.3,-4,.35,2.7,.35,5);break;
 case 'ceramic_vase':case 'flower_vase':{
 const c=key==='ceramic_vase'?3:7;for(const[y,r,h]of[[0,1.6,.3],[.3,2,1],[1.3,2.7,2],[3.3,2.2,1],[4.3,1.3,1]])hoop(0,y,0,r,h,.27,c);hoop(0,5.3,0,1.35,.25,.23,c);round(0,0,0,1.6,.12,c);for(const[y,r,t]of[[.3,1.8,.7],[1.3,2.35,1],[3.3,2.45,.8],[4.3,1.75,1.2]])hoop(0,y-.035,0,r,.07,t,c);
 if(key==='flower_vase')for(let i=0;i<4;i++){const x=(i-1.5)*.9,z=i%2*1.4-.7;put(x,.4,z,.12,7+i%2,.12,6);round(x,7.4+i%2,z,1,.22,4);round(x,7.64+i%2,z,.4,.12,9);}break;}
 case 'succulent_pot':round(0,0,0,2.1,.3,9);hoop(0,.3,0,2.5,2.1,.3,9);round(0,2.2,0,2.2,.15,5);for(let i=0;i<3;i++)for(let j=0;j<8;j++){const t=j*Math.PI/4,r=1.7-i*.55;put(Math.cos(t)*r-.45,2.4+i*.55,Math.sin(t)*r-.7,.9,.4,1.4,6);}break;
 case 'table_clock':put(-3.8,0,-1.5,7.6,.5,3,0);put(-3.5,.5,-.7,7,6.5,1.4,0);face(put(-3.15,.85,.72,6.3,5.8,.035,3));break;
 case 'landscape_frame':put(-5,0,-1.5,10,.5,3,5);put(-4.7,.5,-.5,9.4,7.2,1,5);face(put(-4.3,.9,.52,8.6,6.4,.03,3));put(-.3,.5,-2,.6,4,.4,5);break;
 case 'reed_diffuser':round(0,0,0,2,.4,8);hoop(0,.4,0,2.2,3.6,.35,8);round(0,3.2,0,1.9,.1,9);hoop(0,4,0,1,.5,.2,2);for(let i=0;i<5;i++)put(-.7+i*.35,1,-.35+i%2*.5,.12,7+i%2,.12,5);break;
 case 'storage_box':put(-4.8,0,-3.5,9.6,4.6,7,4);put(-5,4.6,-3.7,10,.4,7.4,4);put(-1.5,2,3.51,3,.8,.08,2);break;
 case 'ring_sculpture':put(-3.5,0,-2,7,.6,4,0);for(let i=0;i<24;i++){const t=i*Math.PI/12,n=t+Math.PI/12,x=3*Math.cos(t),y=4+3*Math.sin(t),xx=3*Math.cos(n),yy=4+3*Math.sin(n),len=Math.hypot(xx-x,yy-y);const c=put((x+xx)/2-len/2,(y+yy)/2-.35,-.45,len+.03,.7,.9,3);c.rotation=[0,0,Math.atan2(yy-y,xx-x)*180/Math.PI];c.pivot=[(x+xx)/2,(y+yy)/2,0];}break;
 case 'desktop_projector':put(-5.5,0,-4,11,.4,8,0);put(-5.5,.4,-4,11,3.2,8,3);put(-4,1,4.02,3,2,.4,0);face(put(-3.75,1.2,4.44,2.5,1.6,.04,1));for(let i=0;i<9;i++)put(.2+i*.45,1,4.02,.18,1.7,.04,0);put(3,3.61,-2,1,.1,.7,0);break;
 case 'conference_phone':put(-5,0,-4,10,.6,8,0);put(-4.4,.6,-3.5,8.8,.7,7,1);face(put(-2.4,1.31,-2.7,4.8,.025,2.8,1),'up');for(let j=0;j<4;j++)for(let i=0;i<3;i++)put(-1.6+i*1.25,1.31,.7+j*.55,.8,.15,.35,0);for(const x of[-4,2.8])for(let i=0;i<5;i++)put(x,1.31,-1.8+i*.5,1.2,.02,.16,0);break;
 case 'network_switch':put(-6,0,-3,12,1.8,6,0);for(let i=0;i<8;i++){put(-5.5+i*1.35,.4,3.01,1.1,.85,.05,2);put(-5.35+i*1.35,.55,3.07,.8,.55,.03,0);put(-5.2+i*1.35,1.4,3.02,.3,.15,.03,10);}break;
 case 'four_bay_nas':put(-4.5,0,-3.5,9,8,7,2);for(let i=0;i<4;i++){put(-4.15+i*2.1,.4,3.51,1.9,7.2,.2,0);put(-3.85+i*2.1,.8,3.72,1.3,.3,.18,2);put(-3.65+i*2.1,6.7,3.72,.35,.2,.03,10);for(let j=0;j<5;j++)put(-3.9+i*2.1,2+j*.65,3.72,1.4,.16,.025,1);}break;
 case 'tower_ups':put(-2.8,0,-4.5,5.6,9,9,0);face(put(-2,5,4.51,4,2,.04,1));put(-.35,3.7,4.53,.7,.7,.06,10);for(let i=0;i<5;i++)put(-2,1+i*.4,4.52,4,.15,.04,1);break;
 case 'compact_shredder':put(-3.8,0,-3,7.6,7,6,1);put(-4.1,7,-3.3,8.2,1.3,6.6,0);put(-3.4,8.31,-.25,6.8,.025,.5,1);put(-2.6,1,3.02,5.2,4.4,.04,0);for(let i=0;i<6;i++)put(-2.2+i*.7,1.4,3.07,.25,3.4,.02,3);put(2.7,7.4,3.32,.5,.4,.03,10);break;
 }
 for(const c of a){const role=c.color??0;for(const f of faces){c.uv??={};c.uv[f]??=uv(96,role*10,30,9);}}
 const result=pruneFaces(a);if(result.length>256)throw Error('Lifestyle model budget '+key);return result;
}
export function lifestyleTexture(key){
 const color=canvas(128,128,[26,30,35,255]),mer=canvas(128,128,[0,0,190,255]);
 const palette=[[27,31,38],[66,74,83],[168,174,178],[235,229,211],[122,41,65],[98,65,39],[70,124,89],[69,108,130],[170,130,75],[191,110,63],[79,171,134]];
 palette.forEach((c,i)=>{rect(color,96,i*10,32,10,[...c,255]);rect(mer,96,i*10,32,10,[i===2?210:0,i===10&&['network_switch','four_bay_nas','tower_ups','compact_shredder'].includes(key)?12:0,i===2?85:i===8?55:190,255]);});
 for(let y=50;y<60;y++)for(let x=96;x<128;x++)if((x+y*2)%9===0)rect(color,x,y,1,1,[121,86,55,255]);
 for(let y=40;y<50;y+=2)for(let x=96;x<128;x+=3)rect(color,x,y,1,1,[136,59,77,255]);
 rect(color,0,0,96,56,[235,229,211,255]);
 if(['notebook_open','document_stack'].includes(key)){for(let i=0;i<9;i++){rect(color,8,7+i*5,80,1,[174,184,183,255]);rect(color,12,6+i*5,44-i%3*9,1,[83,93,113,255]);}rect(color,7,0,1,56,[171,105,116,255]);}
 else if(key==='table_clock'){rect(color,0,0,96,56,[235,229,211,255]);for(let i=0;i<12;i++){const t=i*Math.PI/6;rect(color,Math.round(47+40*Math.sin(t)),Math.round(27-23*Math.cos(t)),2,2,[35,39,44,255]);}for(let i=0;i<19;i++){rect(color,47+i,27-i*.65,2,2,[35,39,44,255]);rect(color,47-i*.7,27-i*.5,2,2,[35,39,44,255]);}rect(color,45,25,4,4,[173,70,63,255]);}
 else if(key==='landscape_frame'){rect(color,0,0,96,56,[118,177,197,255]);rect(color,68,7,10,10,[243,209,133,255]);for(let x=0;x<96;x++){const h=Math.round(12+16*Math.abs(Math.sin(x*.045)));rect(color,x,56-h,1,h,[73,117,122,255]);const h2=Math.round(5+11*Math.abs(Math.cos(x*.04)));rect(color,x,56-h2,1,h2,[49,81,90,255]);}}
 else if(['desktop_projector','conference_phone','tower_ups'].includes(key)){rect(color,0,0,96,56,[12,31,42,255]);if(key==='desktop_projector'){for(let i=0;i<9;i++)rect(color,16+i*4,8+i*2,64-i*8,40-i*4,[36+i*8,71+i*9,104+i*8,255]);}else{text(color,key==='tower_ups'?'UPS 100%':'MEETING',10,8,1,[112,208,192,255]);text(color,key==='tower_ups'?'ONLINE':'10:10',12,26,2,[191,225,214,255]);rect(mer,0,0,96,56,[0,12,65,255]);}}
 else{text(color,key.replaceAll('_',' ').slice(0,14),2,10,1,[61,70,81,255]);}
 return {width:128,height:128,pixels:color.data,png:png(128,128,color.data),mer:png(128,128,mer.data)};
}
