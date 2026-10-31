/** Count engine calls and work per simulated tick; this is not an engine watchdog test. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {state,FakeDimension,FakePlayer,ItemStack,interact,flush,reset,world} from './mock-server.mjs';
registerHooks({resolve(s,c,next){const mock=s==='@minecraft/server'?'mock-server.mjs':s==='@minecraft/server-ui'?'mock-ui.mjs':undefined;return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(s,c);}});
await import('../.build/main.js');
const {loadDecorRecords,maintainDecor,reconcileDecor,synchronize,removeDecor,applianceTick}=await import('../.build/decor-runtime.js');
flush();
const record=(i,extra={})=>({version:1,uid:`stress${i}`,revision:0,dimension:'minecraft:overworld',support:{x:i*12,y:0,z:0},kind:'surface',definition:'mcpe_food:glass',direction:'north',native:false,slots:[],...extra});
const store=r=>world.setDynamicProperty('mcpe_food:decor:'+r.uid,JSON.stringify(r));
function setup(count){reset();state.properties.clear();const d=new FakeDimension();const rows=Array.from({length:count},(_,i)=>record(i));for(const r of rows){d.put('minecraft:stone',r.support);store(r);}return{d,rows};}
function finishLoad(){for(let n=0;state.queue.length;n++){assert.ok(n<2000,'loading must finish');flush();}}
function counters(d){let blocks=0,queries=[];const get=d.getBlock.bind(d),query=d.getEntities.bind(d);d.getBlock=p=>{blocks++;return get(p);};d.getEntities=q=>{queries.push(q);return query(q);};return{get blocks(){return blocks;},get queries(){return queries;},clear(){blocks=0;queries=[];}};}

test('2,500 persisted records load in <=8 property reads per tick without repair or lost items',()=>{
 const{d,rows}=setup(2500),m=counters(d),get=world.getDynamicProperty;let reads=0;
 world.getDynamicProperty=k=>{reads++;return get(k);};
 try{loadDecorRecords();assert.ok(reads<=8);assert.equal(state.queue.length,1);assert.equal(m.blocks,0);
   let ticks=1;while(state.queue.length){reads=0;flush();assert.ok(reads<=8);assert.equal(state.queue.length<=1,true);ticks++;}
   assert.ok(ticks>=313);assert.equal(state.properties.size,2500);assert.equal(d.entities.length,0);assert.equal(d.drops.length,0);
   assert.equal(state.properties.get('mcpe_food:decor:'+rows[2499].uid),JSON.stringify(rows[2499]));
 }finally{world.getDynamicProperty=get;}
});

test('entity-load storm does no inline queries, preserves owners during partial load and drains at bounded rate',()=>{
 const{d,rows}=setup(120),m=counters(d);loadDecorRecords();const before=state.queue.length;
 const entities=Array.from({length:500},(_,i)=>{const r=rows[i%120],e=d.spawnEntity('mcpe_food:surface_display',{x:r.support.x+.5,y:1,z:.5});e.setDynamicProperty('mcpe_food:owner',r.uid);e.setDynamicProperty('mcpe_food:part','base');state.entityLoad({entity:e});return e;});
 assert.equal(state.queue.length,before);assert.equal(m.queries.length,0);maintainDecor();assert.ok(entities.every(e=>e.isValid));assert.equal(m.blocks,0);
 finishLoad();m.clear();maintainDecor();assert.ok(m.queries.length<=2);assert.ok(entities.filter(e=>!e.isValid).length<=8);assert.equal(state.properties.size,120);assert.equal(d.drops.length,0);
 for(let i=0;i<400;i++)maintainDecor();
 const alive=d.getEntities();assert.equal(alive.length,120);for(const r of rows)assert.equal(alive.filter(e=>e.getDynamicProperty('mcpe_food:owner')===r.uid).length,1);
 assert.equal(state.properties.size,120);assert.equal(d.drops.length,0);
});

test('reconciliation cost is bounded independently of 3,000 distant records; query stays local',()=>{
 const{d}=setup(3000),m=counters(d);loadDecorRecords();finishLoad();m.clear();reconcileDecor();
 assert.ok(m.blocks<=24,`block reads: ${m.blocks}`);assert.ok(m.queries.length<=2);assert.equal(d.entities.length,2);
 for(const q of m.queries){assert.deepEqual(q.families,['mcpe_food_display']);assert.ok(q.location);assert.equal(q.maxDistance,8);}
});

test('one filled clothing rack sync queries once, keeps all five parts and removes duplicates',async()=>{
 const {rackById,clothingItems}=await import('../.build/patch-072-catalog.js');
 const{d,rows}=setup(1),spec=[...rackById].find(([,v])=>v.capacity===4),r={...rows[0],kind:'clothing_rack',definition:spec[0],slots:clothingItems.slice(0,4).map(x=>'mcpe_food:'+x.key)};
 store(r);loadDecorRecords();finishLoad();const m=counters(d);synchronize(r);assert.equal(m.queries.length,1);assert.equal(d.getEntities().length,5);
   const duplicate=d.spawnEntity('mcpe_food:surface_display',{x:.5,y:1,z:.5});duplicate.setDynamicProperty('mcpe_food:owner',r.uid);duplicate.setDynamicProperty('mcpe_food:part','base');m.clear();synchronize(r);assert.equal(m.queries.length,1);assert.equal(d.getEntities().length,5);assert.equal(d.drops.length,0);
});

test('startup gates destructive events and fridge tick until all ownership records exist',()=>{
 const{d,rows}=setup(40),r=rows[39];const block=d.put('mcpe_food:fridge_white_compact',r.support),p=new FakePlayer(d);
 loadDecorRecords();const before=state.properties.size;applianceTick(block);const event={player:p,block,cancel:false};state.breakBlock(event);assert.equal(event.cancel,true);assert.equal(state.properties.size,before);
 p.container.setItem(0,new ItemStack('mcpe_food:glass'));assert.equal(interact(p,block).cancel,true);assert.equal(p.container.count('mcpe_food:glass'),1);finishLoad();assert.equal(state.properties.size,before);assert.equal(d.drops.length,0);
});

test('only proven orphan displays are removed after load, unloaded legitimate owners survive',()=>{
 const{d,rows}=setup(30),valid=d.spawnEntity('mcpe_food:surface_display',{x:.5,y:1,z:.5}),orphan=d.spawnEntity('mcpe_food:surface_display',{x:2,y:1,z:.5});valid.setDynamicProperty('mcpe_food:owner',rows[29].uid);orphan.setDynamicProperty('mcpe_food:owner','missing');loadDecorRecords();state.entityLoad({entity:valid});state.entityLoad({entity:orphan});maintainDecor();assert.ok(orphan.isValid);finishLoad();d.unloaded=true;
 for(let i=0;i<10;i++)maintainDecor();assert.ok(valid.isValid);assert.equal(orphan.isValid,false);assert.equal(state.properties.size,30);assert.equal(d.drops.length,0);
});

test('a newer reload invalidates stale scheduled batches without resurrecting removed records',()=>{
 setup(50);loadDecorRecords();state.properties.clear();const r=record(999);store(r);loadDecorRecords();finishLoad();assert.equal(state.properties.size,1);reconcileDecor();assert.equal(state.properties.size,0); // no support in the new dimension for 999
});

test('occupancy index survives delete and recollection with no stale reservations',()=>{
 const{d,rows}=setup(1);loadDecorRecords();finishLoad();synchronize(rows[0]);removeDecor(rows[0],false);assert.equal(state.properties.size,0);
 store(record(7,{support:rows[0].support}));loadDecorRecords();finishLoad();reconcileDecor();assert.equal(state.properties.size,1);assert.equal(d.getEntities().length,1);assert.equal(d.drops.length,0);
});
