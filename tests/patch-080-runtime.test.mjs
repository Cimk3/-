import test,{afterEach}from'node:test';import assert from'node:assert/strict';import{registerHooks}from'node:module';
import{state,FakeDimension,FakePlayer,ItemStack,interact,flush,reset,system}from'./mock-server.mjs';
registerHooks({resolve(s,c,next){const m=s==='@minecraft/server'?'mock-server.mjs':s==='@minecraft/server-ui'?'mock-ui.mjs':undefined;return m?{url:new URL(m,import.meta.url).href,shortCircuit:true}:next(s,c);}});
await import('../.build/main.js');const{removeDecor,loadDecorRecords,reconcileDecor}=await import('../.build/decor-runtime.js');const{patch080Props}=await import('../.build/patch-080-catalog.js');
const id=k=>'mcpe_food:'+k,key='ceiling_arm_display_2x1';const saved=()=>[...state.properties].filter(([k])=>k.startsWith('mcpe_food:decor:')).map(([,v])=>JSON.parse(v));
async function tick(){flush();await new Promise(r=>setImmediate(r));flush();await new Promise(r=>setImmediate(r));}await tick();afterEach(()=>{for(const r of saved())removeDecor(r,false);});
const dirs={north:{n:[0,-1],r:[-1,0],code:1},east:{n:[1,0],r:[0,1],code:2},south:{n:[0,1],r:[1,0],code:3},west:{n:[-1,0],r:[0,-1],code:4}};
function setup(face='south'){reset();const d=new FakeDimension(),p=new FakePlayer(d),s=dirs[face];p.location={x:.5+s.n[0]*3,y:1,z:.5+s.n[1]*3};const b=d.put('minecraft:stone',{x:0,y:3,z:0});d.put('minecraft:stone',{x:s.r[0],y:3,z:s.r[1]});return{d,p,b,s};}
async function place(p,b,k=key,face='Down'){p.container.setItem(0,new ItemStack(id(k)));interact(p,b,true,face);await tick();return saved()[0];}
async function menu(p,b,response={selection:0}){system.currentTick+=10;state.responses.push(response);interact(p,b,true,'Down');await tick();}
test('ceiling mount faces all four player directions, centers over two occupied columns and preserves v1 records on recovery',async()=>{
 for(const face of Object.keys(dirs)){const{d,p,b,s}=setup(face),r=await place(p,b);assert.ok(r,face);assert.equal(r.version,1);assert.equal(r.mount,'ceiling');assert.equal(r.direction,face);assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),s.code);assert.deepEqual(d.getEntities()[0].location,{x:.5+s.r[0]*.5,y:1,z:.5+s.r[1]*.5});const before=JSON.stringify(r);d.getEntities()[0].remove();loadDecorRecords();reconcileDecor();assert.equal(JSON.stringify(saved()[0]),before);assert.equal(d.getEntities().length,1);removeDecor(r,false);}
});
test('ceiling requires two full supports and all four empty cells, rejects top and side placement',async()=>{
 for(const face of Object.keys(dirs)){for(const column of[0,1]){const{d,p,b,s}=setup(face);d.put('minecraft:air',{x:s.r[0]*column,y:3,z:s.r[1]*column});await place(p,b);assert.equal(saved().length,0);assert.equal(p.container.count(id(key)),1);}for(const column of[0,1])for(const y of[1,2]){const{d,p,b,s}=setup(face);d.put('minecraft:stone',{x:s.r[0]*column,y,z:s.r[1]*column});await place(p,b);assert.equal(saved().length,0);}}
 for(const type of['minecraft:oak_slab','minecraft:oak_stairs']){const{d,p}=setup(),b=d.put(type,{x:0,y:3,z:0},{upside_down_bit:true,'minecraft:vertical_half':'top'});await place(p,b);assert.equal(saved().length,0);}
 for(const face of['Up','South']){const{p,b}=setup();await place(p,b,key,face);assert.equal(saved().length,0);}
});
test('unloaded primary, secondary or occupied cell skips cleanup, confirmed missing secondary drops once below ceiling',async()=>{
 for(const pos of[{x:0,y:3,z:0},{x:1,y:3,z:0},{x:1,y:1,z:0}]){const{d,p,b}=setup(),r=await place(p,b),before=JSON.stringify(r),get=d.getBlock.bind(d);d.getBlock=v=>JSON.stringify(v)===JSON.stringify(pos)?undefined:get(v);reconcileDecor();assert.equal(JSON.stringify(saved()[0]),before);assert.equal(d.drops.length,0);d.getBlock=get;removeDecor(r,false);}
 const{d,p,b}=setup();await place(p,b);d.put('minecraft:air',{x:1,y:3,z:0});reconcileDecor();reconcileDecor();assert.equal(saved().length,0);assert.equal(d.drops.length,1);assert.equal(d.drops[0].item.typeId,id(key));assert.ok(d.drops[0].loc.y<3);
});
test('breaking either ceiling support cleans once; creative removal drops nothing',async()=>{
 for(const x of[0,1])for(const creative of[false,true]){const{d,p,b}=setup();await place(p,b);if(creative)p.mode='Creative';const block=d.getBlock({x,y:3,z:0});state.breakBlock({player:p,block,cancel:false});await tick();reconcileDecor();assert.equal(saved().length,0);assert.equal(d.drops.length,creative?0:1);}
});
test('ceiling and floor displays reject intersecting reservations in either placement order',async()=>{
 const{d,p,b}=setup();const support=d.put('minecraft:stone',{x:1,y:0,z:0});await place(p,support,'laboratory_incubator','Up');assert.equal(saved().length,1);await place(p,b);assert.equal(saved().length,1);assert.equal(saved()[0].definition,id('laboratory_incubator'));removeDecor(saved()[0],false);await place(p,b);await place(p,support,'laboratory_incubator','Up');assert.equal(saved().length,1);assert.equal(saved()[0].mount,'ceiling');
});
test('ceiling failed spawn and inventory commit restore exact inventory, creative placement consumes nothing',async()=>{
 for(const failure of['spawn','commit']){const{d,p,b}=setup();p.container.setItem(0,new ItemStack(id(key),2));p.container.items[0].nameTag='original';if(failure==='spawn')d.failSpawn=true;else p.container.failOnce=true;interact(p,b,true,'Down');await tick();assert.equal(saved().length,0);assert.equal(p.container.getItem(0).amount,2);assert.equal(p.container.getItem(0).nameTag,'original');assert.equal(d.getEntities().length,0);}
 const{p,b}=setup();p.mode='Creative';await place(p,b);assert.equal(p.container.count(id(key)),1);assert.equal(saved().length,1);
});
test('pending ceiling retrieval rejects full backpack, competing retrieval and held-item changes',async()=>{
 const{d,p,b}=setup();await place(p,b);p.container.setItem(0);let resolve;await menu(p,b,new Promise(r=>resolve=r));for(let i=0;i<p.container.size;i++)p.container.setItem(i,new ItemStack('minecraft:stone',64));resolve({selection:0});await tick();assert.equal(saved().length,1);p.container.setItem(0);await menu(p,b,new Promise(r=>resolve=r));const q=new FakePlayer(d);q.location={...p.location};await menu(q,b);resolve({selection:0});await tick();assert.equal(saved().length,0);assert.equal(q.container.count(id(key)),1);assert.equal(p.container.count(id(key)),0);
});
test('ordinary new equipment retains nearest-cardinal display and slab/inverted-stair placement',async()=>{
 for(const item of patch080Props.filter(d=>d.key!==key))for(const[type,states,allowed]of[['minecraft:oak_slab',{'minecraft:vertical_half':'bottom'},true],['minecraft:oak_stairs',{upside_down_bit:true},true],['minecraft:oak_stairs',{upside_down_bit:false},false]]){const{d,p}=setup(),b=d.put(type,{x:0,y:0,z:3},states);p.location={x:3.5,y:1,z:3.5};const r=await place(p,b,item.key,'Up');assert.equal(saved().length,allowed?1:0,item.key);if(allowed){assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),2);removeDecor(r,false);}}
});
test('all ordinary devices use four cardinals, diagonal positions and center-view fallback, while tall upper obstruction rejects',async()=>{
 for(const item of patch080Props.filter(d=>d.key!==key)){for(const[x,z,code]of[[3,0,2],[-3,0,4],[0,3,3],[0,-3,1],[2,3,3],[-3,-2,4],[0,0,2]]){const{d,p}=setup(),b=d.put('minecraft:stone',{x:0,y:0,z:4});p.location={x:.5+x,y:1,z:4.5+z};p.getRotation=()=>({x:0,y:90});const r=await place(p,b,item.key,'Up');assert.ok(r,item.key);assert.equal(d.getEntities()[0].getProperty('mcpe_food:display_facing'),code,item.key);removeDecor(r,false);}if(item.height===2){const{d,p}=setup(),b=d.put('minecraft:stone',{x:0,y:0,z:4});p.location={x:.5,y:1,z:6};d.put('minecraft:stone',{x:0,y:2,z:4});await place(p,b,item.key,'Up');assert.equal(saved().length,0);}}
});
test('pending ceiling retrieval rechecks hand, distance and record revision; collection commit rollback preserves the instance',async()=>{
 for(const change of['hand','distance','revision']){const{p,b}=setup();await place(p,b);p.container.setItem(0);let resolve;await menu(p,b,new Promise(r=>resolve=r));if(change==='hand')p.container.setItem(0,new ItemStack('minecraft:stone'));if(change==='distance')p.location={x:100,y:1,z:100};if(change==='revision'){const r=saved()[0];r.revision++;state.properties.set('mcpe_food:decor:'+r.uid,JSON.stringify(r));loadDecorRecords();}resolve({selection:0});await tick();assert.equal(saved().length,1);assert.equal(p.container.count(id(key)),0);removeDecor(saved()[0],false);}
 const{p,b}=setup();await place(p,b);p.container.setItem(0);p.container.failOnce=true;await menu(p,b);assert.equal(saved().length,1);assert.equal(p.container.count(id(key)),0);
});
