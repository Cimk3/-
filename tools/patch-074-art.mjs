/** 0.7.4 original static equipment; authored +Z front, baked to local -Z. */
import {canvas,rect,text,png} from './art.mjs';
import {disc,pruneFaces} from './detail-art.mjs';
import {northFacingCubes} from './patch-072-art.mjs';
import {patch074Screens} from '../.build/patch-074-catalog.js';
export function patch074Cubes(key){
 const a=[],p=(x,y,z,w,h,d,color=0)=>{const c={origin:[x,y,z],size:[w,h,d],color,material:'ware'};a.push(c);return c;};
 const panel=(x,y,z,w,h)=>{const c=p(x,y,z,w,h,.05,1);c.uv={south:{uv:[0,0],uv_size:[96,56],material_instance:'ware'}};};
 const badge=(x,y,z,w,h)=>{const c=p(x,y,z,w,h,.05,7);c.uv={south:{uv:[0,64],uv_size:[80,20],material_instance:'ware'}};};
 const base=(h=.8)=>p(-7.5,0,-7,15,h,14,1);
 const feet=()=>{p(-7,0,-6,14,.8,12,1);p(-.45,.8,-.45,.9,18,.9,2);};
 const bolts=(y,z)=>{for(const x of[-6,5.5])p(x,y,z,.5,.5,.08,2);};
 const vent=(x,y,z,w,n=6)=>{for(let i=0;i<n;i++)p(x,y+i*.65,z,w,.18,.08,1);};
 if(key==='electrical_distribution_cabinet'){
  base();p(-7, .8,-5.8,14,29,11.6,0);p(-6.6,1.5,5.82,13.2,27.5,.18,2);p(-5.7,17,6.02,11.4,8,.07,4);for(let i=0;i<4;i++)p(-4.8+i*2.5,19,6.1,1.2,3,.12,i===0?3:1);vent(-5,4,6.04,10,8);p(5,11,6.05,.6,3,.4,1);bolts(27,6.05);
 }else if(key==='dry_type_transformer'){
  base();p(-7,1,-5.5,14,24,11,2);for(const x of[-5.6,-1.4,2.8]){p(x,3,5.55,2.8,18,.3,3);for(let i=0;i<7;i++)p(x+.2,4+i*2.3,5.9,2.4,.3,.12,1);p(x+.8,25,-2,1.2,4,1.2,6);p(x+.3,28.5,-2.5,2.2,.8,2.2,4);}p(-7,25,-5.5,14,1,11,1);
 }else if(key==='standby_generator'){
  base();p(-7,1,-6,14,25,12,0);p(-6.7,1.5,6.02,13.4,23,.15,3);vent(-5.7,3,6.2,8,12);p(3,16,6.2,2.8,5,.12,1);p(3.3,18,6.35,2.1,1,.06,6);p(-5,26,-4,2,3,2,2);p(-5.4,28.5,-4.4,2.8,.6,2.8,1);p(-6.2,23,6.2,4,1,.1,6);
 }else if(key==='cable_reel'){
  base();p(-6,1,-3,12,1,6,2);for(let i=0;i<3;i++)disc(a,0,2+i*2.3,0,4.5,4.5,1.7,i===1?1:2,'ware',12);p(-5,9,-.6,10,.8,1.2,0);
 }else if(key==='electrician_toolbox'){
  p(-7,0,-5,14,5,10,3);p(-7,5,-5,14,1,10,1);p(-4,6,-.3,.6,2,.6,2);p(3.4,6,-.3,.6,2,.6,2);p(-4,7.5,-.3,8,.5,.6,2);p(-5,3,5.02,2,1,.12,6);p(3,3,5.02,2,1,.12,6);p(-6,1,5.03,12,.35,.1,2);
 }else if(key==='wall_electric_meter'){
  p(-7,0,0,14,14,3,0);p(-6.4,.6,3.02,12.8,12.8,.12,2);p(-4,6.5,3.16,8,5,.06,7);for(let i=0;i<5;i++)p(-3.6+i*1.4,8,3.24,.8,1.4,.04,1);p(-4,2,3.16,8,2,.06,1);p(5,3,3.16,.5,3,.2,1);bolts(12,3.16);
 }else if(key==='insulator_display'){
  p(-7,0,-5.5,14,.7,11,1);for(const x of[-4,0,4]){p(x-.35,.7,-.35,.7,7,.7,2);for(let y=1.4;y<7;y+=1.3)disc(a,x,y,0,1.5,1.5,.3,4,'ware',8);p(x-.7,7,-.7,1.4,.5,1.4,2);}
 }else if(key==='field_news_camera'||key==='studio_news_camera'){
  const studio=key==='studio_news_camera';base();if(studio){p(-3,.8,-3,6,16,6,2);}else{for(const [x,z]of[[-5,-4],[5,-4],[0,5]])for(let i=0;i<5;i++){const t=1-i*.18;p(x*t-.38,.8+i*2.5,z*t-.38,.76,2.5,.76,2);}}p(-.6,.8,-.6,1.2,18,1.2,2);p(-7,19,-4.5,14,8,9,0);p(-5,21,4.55,10,5,.5,1);p(-3.7,21.7,5.06,7.4,3.6,1.8,2);p(-2.8,22.1,6.88,5.6,2.8,.12,1);p(-5.5,27,-2.8,11,2.2,5.5,2);p(-4,29,-1,8,.7,2,3);if(studio){p(-6,10,-2,12,2,4,2);p(-7,12,-4,14,2,8,1);p(5,22,-4.5,1.5,4,.08,6);}else{p(-6,27,-3,1,3,6,2);p(-6,29,-3,10,.5,.5,2);}
 }else if(key==='news_microphone_stand'){
  feet();p(-7,19,-4,14,10,8,0);p(-6.5,19.5,4.05,13,8.8,.06,3);badge(-5,23,4.13,10,3);for(const x of[-2,1.4]){p(x,29,-.3,.6,2,.6,2);p(x-.45,31,-.9,1.5,1,1.8,1);}
 }else if(key==='interview_audio_set'){
  p(-7,0,-5,14,.5,10,2);p(-6,.5,-3,5,2,6,0);p(-5.5,2.5,-2.5,4,.1,5,1);for(let i=0;i<4;i++)p(-5.1+i*.9,2.65,-2,.5,.1,.7,6);p(1,.5,-1,4,1.1,2,1);p(4.6,.5,-1.4,1.6,2,2.8,0);p(1.3,1.65,-.7,2.5,.1,1.4,3);
 }else if(key==='news_teleprompter'){
  feet();p(-6.8,19,-3.5,13.6,10,7,0);p(-6.2,19.7,3.55,12.4,8.6,.2,2);panel(-5.7,20.3,3.8,11.4,7.4);p(-7,29.1,-4,14,.6,8,1);p(-6.5,18.6,-4,13,.4,8,1);
 }else if(key==='broadcast_control_desk'){
  p(-7.5,0,-6.5,15,4,13,0);p(-7.1,4,-6,14.2,1,12,2);panel(-6.6,5.1,1.6,6.3,3.5);p(-6.8,4.9,1.4,6.8,4,.2,1);for(let row=0;row<3;row++)for(let i=0;i<7;i++)p(.4+i*.85,5.03,-4+row*1.4,.55,.15,.9,(i+row)%3===0?3:1);for(let i=0;i<5;i++)p(-6+i*1.1,5.02,-4,.25,.15,3,1);
 }else if(key==='news_backdrop'){
  p(-7.5,0,-3,15,.8,6,1);p(-7, .8,-.8,14,30,1.6,3);p(-6.5,1.5,.82,13,28.5,.12,0);badge(-6,23,.96,12,4);p(-5.5,15,.96,11,.7,.06,6);p(-5.5,13,.96,8,.5,.06,6);p(-5.5,11,.96,10,.5,.06,6);
 }else if(key==='riot_shield_display'){
  base();p(-.4,.8,-.4,.8,22,.8,2);p(-7,4,0,14,24,1,0);p(-6.5,4.6,1.03,13,22.8,.08,2);p(-4.5,19,1.12,9,4,.08,7);p(-4,20,1.21,8,1.6,.04,1);p(-5,7,1.12,10,1,.05,1);p(-5,9,1.12,10,1,.05,1);
 }else if(key==='road_safety_barrier'){
  p(-7.5,0,-5,15,1,10,1);for(const x of[-6,5])p(x,1,-.5,1,12,1,2);p(-7,11,-.8,14,4,1.6,3);for(let i=0;i<4;i++)p(-6.5+i*3.2,11.2,.84,1.6,3.6,.07,7);
 }else if(key==='military_police_cabinet'){
  base();p(-7,.8,-6,14,29,12,0);p(-6.6,1.3,6.03,6.2,27.8,.12,2);p(.4,1.3,6.03,6.2,27.8,.12,2);for(const x of[-1.3,.8])p(x,13,6.2,.5,3,.3,1);vent(-5.8,21,6.2,4,6);vent(1.8,21,6.2,4,6);bolts(28,6.2);
 }else if(key==='helmet_display'){
  p(-6,0,-5,12,.7,10,1);p(-.5,.7,-.5,1,3,1,2);p(-4,3.7,-3.4,8,2,6.8,3);p(-3.4,5.7,-3,6.8,2,6,3);p(-2.5,7.7,-2.3,5,1,4.6,3);p(-4.4,4,-3.6,8.8,.5,.3,1);
 }else if(key==='communications_radio'){
  p(-7,0,-5.5,14,5,11,0);p(-6.7,.6,5.53,13.4,4,.08,2);panel(-5.8,2,5.65,4,2);for(let i=0;i<4;i++)p(-.7+i*1.5,1.6,5.65,.8,1,.2,1);p(5,5,-4,.5,9,.5,1);p(-6,5,-4,3,.6,3,1);
 }else if(key==='radar_equipment'){
  base();p(-6,.8,-5,12,8,10,0);panel(-4.8,3,5.05,7.6,4.5);p(-.5,8.8,-.5,1,9,1,2);p(-7,18,-2,14,10,1,2);p(-6.4,18.6,-.95,12.8,8.8,.12,1);for(let i=0;i<5;i++)p(-6,19+i*1.6,-.8,12,.25,.08,4);p(-.35,18.8,-.7,.7,8.4,.1,6);
 }else if(key==='tactical_equipment_case'){
  p(-7,0,-5,14,5.5,10,3);p(-7,5.5,-5,14,.8,10,1);p(-4,6.3,-.4,8,.5,.8,2);for(const x of[-5,3.8])p(x,3.7,5.05,1.2,1.3,.18,2);p(-6,1,5.05,12,.3,.08,1);p(-6,2,5.05,12,.2,.08,1);
 }else throw Error('Unknown 0.7.4 model '+key);
 for(const c of a)for(const f of['north','south','east','west','up','down']){c.uv??={};c.uv[f]??={uv:[98,64+c.color*4],uv_size:[28,3],material_instance:'ware'};}
 const out=northFacingCubes(pruneFaces(a));if(out.length>256)throw Error('0.7.4 cube budget '+key);return out;
}
export function patch074Texture(key){
 const electrical=['electrical_distribution_cabinet','dry_type_transformer','standby_generator','cable_reel','electrician_toolbox','wall_electric_meter','insulator_display'].includes(key);
 const news=key.includes('news_')||['field_news_camera','studio_news_camera','interview_audio_set','broadcast_control_desk'].includes(key);
 const colors=electrical?[[94,107,113,255],[35,45,53,255],[174,182,176,255],[212,156,48,255],[176,95,50,255],[67,78,86,255],[231,208,125,255],[225,230,220,255]]:news?[[36,47,58,255],[18,25,33,255],[111,127,139,255],[39,84,126,255],[71,125,153,255],[188,63,56,255],[210,223,227,255],[240,241,229,255]]:[[59,70,66,255],[29,36,39,255],[135,148,144,255],[100,113,78,255],[80,130,107,255],[166,75,56,255],[194,206,176,255],[228,231,219,255]];
 const im=canvas(128,128,colors[0]),mer=canvas(128,128,[0,0,190,255]);
 colors.forEach((c,i)=>{rect(im,96,64+i*4,32,4,c);rect(mer,96,64+i*4,32,4,[i===2?130:0,0,i===2?100:190,255]);});
 rect(im,0,0,96,56,[20,31,43,255]);rect(im,0,0,96,10,[42,90,134,255]);text(im,key==='news_teleprompter'?'FT NEWS':key==='broadcast_control_desk'?'FT NEWS LIVE':key==='radar_equipment'?'RADAR DISPLAY':'FT RADIO',3,2,1,[242,241,231,255]);
 if(key==='news_teleprompter'){text(im,'WELCOME TO',5,16,1,[244,244,235,255]);text(im,'FT NEWS',5,29,2,[244,244,235,255]);text(im,'TODAY',5,47,1,[176,203,218,255]);}
 else if(key==='radar_equipment'){for(let i=0;i<5;i++)rect(im,14+i*14,16,1,34,[58,111,93,255]);for(let i=0;i<4;i++)rect(im,10,17+i*9,73,1,[58,111,93,255]);rect(im,48,28,3,3,[119,208,142,255]);}
 else{for(let i=0;i<3;i++){rect(im,5,15+i*11,22,7,[69,129,157,255]);rect(im,32,17+i*11,50-i*6,2,[174,205,215,255]);}}
 rect(im,0,64,80,20,[236,240,235,255]);text(im,'FT NEWS',19,70,1,[36,72,104,255]);
 if(patch074Screens.has(key))rect(mer,0,0,96,56,[0,12,65,255]);
 return{width:128,height:128,pixels:im.data,png:png(128,128,im.data),mer:png(128,128,mer.data)};
}
