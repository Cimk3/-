import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {state,FakeDimension,FakePlayer,ItemStack,interact,flush,reset,system,world} from './mock-server.mjs';
registerHooks({resolve(specifier,context,next){const mock=specifier==='@minecraft/server'?'mock-server.mjs':specifier==='@minecraft/server-ui'?'mock-ui.mjs':undefined;return mock?{url:new URL(mock,import.meta.url).href,shortCircuit:true}:next(specifier,context);}});
await import('../.build/main.js');
const {removeDecor,reconcileDecor,loadDecorRecords}=await import('../.build/decor-runtime.js');
const {surfaceHeight}=await import('../.build/supports.js');
const {electronics}=await import('../.build/electronics-catalog.js');
const idle=()=>new Promise(resolve=>setImmediate(resolve));
async function tick(){flush();await idle();flush();await idle();}
await tick();
const saved=()=>[...state.properties].filter(([k])=>k.startsWith('mcpe_food:decor:')).map(([,v])=>JSON.parse(v));
afterEach(()=>{for(const r of saved())removeDecor(r,false);state.responses=[];});
function setup(support='minecraft:stone',states={}){reset();const dimension=new FakeDimension(),player=new FakePlayer(dimension),base=dimension.put(support,{x:0,y:0,z:0},states);return{dimension,player,base};}
async function place(player,base,key){player.container.setItem(0,new ItemStack(`mcpe_food:${key}`));interact(player,base);await tick();return saved()[0];}
function entityFor(d,r,part='base'){return d.getEntities().find(e=>e.getDynamicProperty('mcpe_food:owner')===r.uid&&e.getDynamicProperty('mcpe_food:part')===part);}
async function useEntity(player,target,selection){if(selection!==undefined)state.responses.push({selection});const e={player,target,cancel:false};state.entityInteract(e);await tick();return e;}
test('support heights cover ordinary/chiseled bookshelves and upper/lower/double slab states',()=>{
  const{dimension}=setup();
  for(const[type,states,height]of[['minecraft:bookshelf',{},1],['minecraft:chiseled_bookshelf',{},1],['minecraft:oak_slab',{'minecraft:vertical_half':'bottom'},.5],['minecraft:normal_stone_slab',{'top_slot_bit':true},1],['minecraft:cut_copper_slab',{'minecraft:vertical_half':'top'},1],['minecraft:oak_double_slab',{},1],['minecraft:oak_stairs',{},0]])assert.equal(surfaceHeight(dimension.put(type,{x:2,y:0,z:0},states)),height,type);
});
test('lower slab keeps the original block while a cup sits at its true surface height',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab',{'minecraft:vertical_half':'bottom'}),r=await place(player,base,'glass');
  assert.equal(base.typeId,'minecraft:oak_slab');assert.equal(dimension.getBlock({x:0,y:1,z:0}).typeId,'minecraft:air');assert.equal(player.container.count('mcpe_food:glass'),0);assert.equal(entityFor(dimension,r).location.y,.5);
});
test('bookcase placement suppresses book use and preserves actual vessel through low-surface serving',async()=>{
  const{dimension,player,base}=setup('minecraft:chiseled_bookshelf');await place(player,base,'black_gold_plate');const r=saved()[0],e=entityFor(dimension,r);
  player.container.setItem(0,new ItemStack('mcpe_food:steak'));await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:steak_on_black_gold_plate');
  system.currentTick+=10;await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:black_gold_plate');assert.equal(player.container.count('mcpe_food:steak'),1);assert.equal(base.typeId,'minecraft:chiseled_bookshelf');
});
test('wine glass accepts premium red wine, rejects cola, and returns its own empty stemware',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'wine_glass'),e=entityFor(dimension,r);
  player.container.setItem(0,new ItemStack('mcpe_food:cola'));await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:wine_glass');assert.equal(player.container.count('mcpe_food:cola'),1);
  player.container.setItem(0,new ItemStack('mcpe_food:premium_red_wine'));system.currentTick+=10;await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:premium_red_wine_on_wine_glass');
  system.currentTick+=10;await useEntity(player,e);assert.equal(saved()[0].definition,'mcpe_food:wine_glass');assert.equal(player.container.count('mcpe_food:premium_red_wine'),1);
});
test('a one-cell tray holds three independent plate dishes and keeps display-only food nonconsumable',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'triple_tray'),e=entityFor(dimension,r);
  const foods=['steak','sushi_platter','beef_slices'];
  for(let i=0;i<3;i++){player.container.setItem(0,new ItemStack(`mcpe_food:${foods[i]}`));system.currentTick+=10;await useEntity(player,e,i);}
  assert.deepEqual(saved()[0].slots,foods.map(k=>'mcpe_food:'+k));assert.equal(dimension.getEntities().length,4);
  system.currentTick+=10;await useEntity(player,e,1);assert.equal(player.container.count('mcpe_food:sushi_platter'),1);assert.equal(saved()[0].slots[0],'mcpe_food:steak');assert.equal(saved()[0].slots[1],null);assert.equal(player.container.count('mcpe_food:plate'),0);
});
test('native tray uses one block, and losing support drops exactly the tray plus its filled slots',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'triple_tray');assert.equal(r.native,true);const block=dimension.getBlock({x:0,y:1,z:0});assert.equal(block.typeId,'mcpe_food:triple_tray');
  player.container.setItem(0,new ItemStack('mcpe_food:steak'));state.responses=[{selection:2}];interact(player,block);await tick();base.setPermutation({typeId:'minecraft:air',getAllStates:()=>({})});reconcileDecor();
  assert.equal(saved().length,0);assert.deepEqual(dimension.drops.map(d=>d.item.typeId).sort(),['mcpe_food:steak','mcpe_food:triple_tray']);assert.equal(dimension.getEntities().length,0);
});
test('an engine onPlace callback during scripted placement reuses the same persisted tray',async()=>{
  const{dimension,player,base}=setup(),target=dimension.getBlock({x:0,y:1,z:0}),original=target.setPermutation.bind(target);
  target.setPermutation=p=>{original(p);if(p.typeId==='mcpe_food:triple_tray')state.components.get('mcpe_food:table').onPlace({block:target});};
  await place(player,base,'triple_tray');assert.equal(saved().length,1);assert.equal(saved()[0].definition,'mcpe_food:triple_tray');assert.equal(player.container.count('mcpe_food:triple_tray'),0);
});
test('tray menus reject wrong dish type, occupied slots, cancellations and changed held food',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'triple_tray'),e=entityFor(dimension,r);
  player.container.setItem(0,new ItemStack('mcpe_food:beef_noodle_soup'));await useEntity(player,e,0);assert.deepEqual(saved()[0].slots,[null,null,null]);state.responses=[];
  player.container.setItem(0,new ItemStack('mcpe_food:steak',2));system.currentTick+=10;state.responses=[{canceled:true}];await useEntity(player,e);assert.equal(player.container.count('mcpe_food:steak'),2);
  system.currentTick+=10;await useEntity(player,e,0);assert.equal(player.container.count('mcpe_food:steak'),1);system.currentTick+=10;await useEntity(player,e,0);assert.equal(player.container.count('mcpe_food:steak'),1);
  let resolve;state.responses=[new Promise(r=>resolve=r)];system.currentTick+=10;const event={player,target:e,cancel:false};state.entityInteract(event);await tick();player.container.setItem(0,new ItemStack('mcpe_food:cookies'));resolve({selection:1});await tick();assert.equal(saved()[0].slots[1],null);assert.equal(player.container.count('mcpe_food:cookies'),1);
});
test('two players cannot retrieve the same tray serving through concurrent menus',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'triple_tray'),e=entityFor(dimension,r);player.container.setItem(0,new ItemStack('mcpe_food:steak'));await useEntity(player,e,0);
  const other=new FakePlayer(dimension);system.currentTick+=10;state.responses=[{selection:0},{selection:0}];state.entityInteract({player,target:e,cancel:false});state.entityInteract({player:other,target:e,cancel:false});await tick();assert.equal(player.container.count('mcpe_food:steak')+other.container.count('mcpe_food:steak'),1);assert.equal(saved()[0].slots[0],null);
});
test('display-spawn failure rolls back food inventory and the saved tray revision',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'triple_tray'),block=dimension.getBlock({x:0,y:1,z:0});dimension.failSpawn=true;
  player.container.setItem(0,new ItemStack('mcpe_food:steak'));state.responses=[{selection:0}];interact(player,block);await tick();assert.equal(player.container.count('mcpe_food:steak'),1);assert.deepEqual(saved()[0].slots,[null,null,null]);assert.equal(saved()[0].revision,r.revision);dimension.failSpawn=false;
});
test('blocked space does not consume a surface item or replace the slab',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab');dimension.put('minecraft:stone',{x:0,y:1,z:0});await place(player,base,'pepsi_paper_cup');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:pepsi_paper_cup'),1);assert.equal(base.typeId,'minecraft:oak_slab');
});
test('an existing filled block migrates to a lower slab without losing its serving, vessel or direction',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),block=dimension.put('mcpe_food:premium_red_wine_serving',{x:0,y:1,z:0},{'minecraft:cardinal_direction':'west'});
  state.components.get('mcpe_food:table').onTick({block});const r=saved()[0];assert.equal(block.typeId,'minecraft:air');assert.equal(base.typeId,'minecraft:oak_slab');assert.equal(r.definition,'mcpe_food:premium_red_wine_serving');assert.equal(r.direction,'west');
  await useEntity(player,entityFor(dimension,r));assert.equal(player.container.count('mcpe_food:premium_red_wine'),1);assert.equal(saved()[0].definition,'mcpe_food:glass');
});
test('slab completion raises the same display and missing/unloaded chunks never duplicate content',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'glass'),e=entityFor(dimension,r);base.setPermutation({typeId:'minecraft:oak_double_slab',getAllStates:()=>({})});reconcileDecor();assert.equal(e.location.y,1);
  dimension.unloaded=true;reconcileDecor();assert.equal(saved().length,1);assert.equal(dimension.drops.length,0);dimension.unloaded=false;
  e.remove();loadDecorRecords();reconcileDecor();assert.equal(dimension.getEntities().length,1);assert.equal(entityFor(dimension,r).location.y,1);
  const duplicate=dimension.spawnEntity('mcpe_food:surface_display',{x:0,y:1,z:0});duplicate.setDynamicProperty('mcpe_food:owner',r.uid);duplicate.setDynamicProperty('mcpe_food:part','base');reconcileDecor();assert.equal(dimension.getEntities().length,1);
});
function wall(d,w=6,h=3){for(let x=0;x<w;x++)for(let y=0;y<h;y++)d.put('minecraft:stone',{x:-x,y,z:0});return d.getBlock({x:0,y:0,z:0});}
test('advertisement chooses a size, keeps its original wall, and resizes without stretching its saved aspect',async()=>{
  const{dimension,player}=setup();const base=wall(dimension);player.container.setItem(0,new ItemStack('mcpe_food:ad_wellington'));state.responses=[{selection:0}];interact(player,base,true,'North');await tick();let r=saved()[0];assert.equal(r.size,0);assert.equal(player.container.count('mcpe_food:ad_wellington'),0);assert.equal(base.typeId,'minecraft:stone');
  state.responses=[{selection:2}];interact(player,base,true,'North');await tick();r=saved()[0];assert.equal(r.size,2);assert.equal(entityFor(dimension,r,'poster').getProperty('mcpe_food:size'),2);
  system.currentTick+=10;state.responses=[{selection:3}];interact(player,base,true,'North');await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:ad_wellington'),1);
});
test('poster overlap, insufficient wall and blocked resize leave items and existing art unchanged',async()=>{
  const{dimension,player}=setup(),base=wall(dimension,2,1);player.container.setItem(0,new ItemStack('mcpe_food:ad_wellington',2));state.responses=[{selection:0}];interact(player,base,true,'North');await tick();assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:ad_wellington'),1);
  state.responses=[{selection:0}];interact(player,base,true,'North');await tick();assert.equal(saved().length,1);assert.equal(player.container.count('mcpe_food:ad_wellington'),1);
  player.container.setItem(0);state.responses=[{selection:2}];interact(player,base,true,'North');await tick();assert.equal(saved()[0].size,0);
});
test('an upper slab is a table surface but cannot replace a complete poster backing wall',async()=>{
  const{player,base}=setup('minecraft:oak_slab',{'minecraft:vertical_half':'top'});assert.equal(surfaceHeight(base),1);player.container.setItem(0,new ItemStack('mcpe_food:ad_lamb'));state.responses=[{selection:0}];interact(player,base,true,'North');await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:ad_lamb'),1);
});
test('independent advertisements place on all four wall directions and keep their own rotation',async()=>{
  for(const[face,angle]of[['North',0],['South',180],['East',-90],['West',90]]){
    const{dimension,player,base}=setup();player.container.setItem(0,new ItemStack('mcpe_food:ad_lamb'));state.responses=[{selection:0}];interact(player,base,true,face);await tick();const r=saved()[0];assert.equal(r.direction,face.toLowerCase());assert.equal(entityFor(dimension,r,'poster').rotation.y,angle);removeDecor(r,false);
  }
});
test('full inventory or canceled poster dialog cannot lose the poster or replace backing blocks',async()=>{
  const{dimension,player}=setup(),base=wall(dimension);player.container.setItem(0,new ItemStack('mcpe_food:ad_wellington'));state.responses=[{canceled:true}];interact(player,base,true,'North');await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:ad_wellington'),1);
  state.responses=[{selection:0}];interact(player,base,true,'North');await tick();let resolve;state.responses=[new Promise(r=>resolve=r)];interact(player,base,true,'North');await tick();for(let i=0;i<player.container.size;i++)player.container.setItem(i,new ItemStack('minecraft:stone',64));resolve({selection:3});await tick();assert.equal(saved().length,1);assert.equal(base.typeId,'minecraft:stone');
});
test('creative destruction of a slab display produces no drops, while survival preserves its exact prop',async()=>{
  for(const creative of[true,false]){
    const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'coca_cola_paper_cup');player.mode=creative?'Creative':'Survival';
    const event={player,block:base,cancel:false};state.breakBlock(event);assert.equal(event.cancel,false);await tick();assert.equal(saved().length,0);assert.equal(dimension.drops.length,creative?0:1);if(!creative)assert.equal(dimension.drops[0].item.typeId,r.definition);
  }
});
test('hitting a custom display removes only its owning record and returns the correct prop once',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'pepsi_paper_cup'),e=entityFor(dimension,r);
  state.hitEntity({damagingEntity:player,hitEntity:e});state.hitEntity({damagingEntity:player,hitEntity:e});assert.equal(saved().length,0);assert.equal(dimension.drops.length,1);assert.equal(dimension.drops[0].item.typeId,'mcpe_food:pepsi_paper_cup');assert.equal(base.typeId,'minecraft:oak_slab');
});

test('all fifteen electronics sit on full blocks, bookshelves and wood/stone/copper slab heights without replacing supports',async()=>{
  const supports=[['minecraft:stone',{},1],['minecraft:bookshelf',{},1],['minecraft:chiseled_bookshelf',{},1],...[
    ['minecraft:oak_slab','minecraft:oak_double_slab'],['minecraft:normal_stone_slab','minecraft:normal_stone_double_slab'],['minecraft:cut_copper_slab','minecraft:double_cut_copper_slab']
  ].flatMap(([single,double])=>[[single,{'minecraft:vertical_half':'bottom'},.5],[single,{'minecraft:vertical_half':'top'},1],[double,{},1]])];
  for(const d of electronics)for(const[type,states,height]of supports){
    const{dimension,player,base}=setup(type,states),r=await place(player,base,d.key),e=entityFor(dimension,r);
    assert.ok(r,d.key);assert.equal(base.typeId,type);assert.equal(r.definition,`mcpe_food:${d.key}`);assert.equal(r.kind,'surface');assert.equal(r.native,false);assert.equal(e.location.y,height);assert.equal(e.getDynamicProperty('mcpe_food:shape'),d.key);assert.equal(player.container.count(r.definition),0);removeDecor(r,false);
  }
});

test('electronic placement preserves the four chosen directions',async()=>{
  for(const[rotation,direction,yaw]of [[0,'south',180],[90,'west',90],[180,'north',0],[270,'east',-90]]){
    const{dimension,player,base}=setup();player.getRotation=()=>({x:0,y:rotation});const r=await place(player,base,'desktop_computer');assert.equal(r.direction,direction);assert.equal(entityFor(dimension,r).rotation.y,yaw);removeDecor(r,false);
  }
});

test('two players placing electronics on the same surface create one owner and charge only the successful player',async()=>{
  const{dimension,player,base}=setup(),other=new FakePlayer(dimension);player.container.setItem(0,new ItemStack('mcpe_food:router'));other.container.setItem(0,new ItemStack('mcpe_food:server_cabinet'));
  interact(player,base);interact(other,base);await tick();assert.equal(saved().length,1);assert.equal(dimension.getEntities().length,1);assert.equal(player.container.count('mcpe_food:router')+other.container.count('mcpe_food:server_cabinet'),1);
  interact(player,base);await tick();assert.equal(saved().length,1);assert.equal(other.container.count('mcpe_food:server_cabinet'),1);
});

test('blocked electronics, deferred hand changes and distant placement never consume inventory',async()=>{
  const{dimension,player,base}=setup();dimension.put('minecraft:stone',{x:0,y:1,z:0});await place(player,base,'macbook_closed');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:macbook_closed'),1);
  dimension.put('minecraft:air',{x:0,y:1,z:0});interact(player,base);player.container.setItem(0,new ItemStack('mcpe_food:router'));await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:router'),1);
  player.location={x:100,y:1,z:100};interact(player,base);await tick();assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:router'),1);
});

test('electronic entity spawn failure restores the exact item and removes the persistent owner',async()=>{
  const{dimension,player,base}=setup();dimension.failSpawn=true;await place(player,base,'thinkpad_open');assert.equal(saved().length,0);assert.equal(player.container.count('mcpe_food:thinkpad_open'),1);assert.equal(base.typeId,'minecraft:stone');dimension.failSpawn=false;
});

test('electronics keep their style and pose across slab height changes, saved records, unloaded chunks and duplicate repair',async()=>{
  const{dimension,player,base}=setup('minecraft:oak_slab'),r=await place(player,base,'macbook_closed');const e=entityFor(dimension,r),index=e.getProperty('mcpe_food:index');
  base.setPermutation({typeId:'minecraft:oak_double_slab',getAllStates:()=>({})});reconcileDecor();assert.equal(e.location.y,1);
  dimension.unloaded=true;reconcileDecor();assert.equal(saved().length,1);assert.equal(dimension.drops.length,0);dimension.unloaded=false;
  e.remove();loadDecorRecords();reconcileDecor();let current=entityFor(dimension,r);assert.equal(current.getProperty('mcpe_food:index'),index);assert.equal(current.location.y,1);assert.equal(saved()[0].definition,'mcpe_food:macbook_closed');
  const duplicate=dimension.spawnEntity(current.typeId,current.location);duplicate.setDynamicProperty('mcpe_food:owner',r.uid);duplicate.setDynamicProperty('mcpe_food:part','base');reconcileDecor();assert.equal(dimension.getEntities().length,1);
  base.setPermutation({typeId:'minecraft:oak_slab',getAllStates:()=>({'minecraft:vertical_half':'bottom'})});reconcileDecor();current=entityFor(dimension,r);assert.equal(current.location.y,.5);assert.equal(current.getProperty('mcpe_food:index'),index);
});

test('electronic props ignore serving and clicking, and repeated destruction returns the exact pose once in survival',async()=>{
  const{dimension,player,base}=setup(),r=await place(player,base,'gaming_laptop_closed'),e=entityFor(dimension,r);
  player.container.setItem(0,new ItemStack('mcpe_food:steak'));await useEntity(player,e);assert.equal(saved()[0].definition,r.definition);assert.equal(player.container.count('mcpe_food:steak'),1);
  player.container.setItem(0);await useEntity(player,e);assert.equal(saved()[0].definition,r.definition);
  state.hitEntity({damagingEntity:player,hitEntity:e});state.hitEntity({damagingEntity:player,hitEntity:e});assert.equal(saved().length,0);assert.equal(dimension.drops.length,1);assert.equal(dimension.drops[0].item.typeId,r.definition);
});

test('creative electronics placement retains held inventory and support removal creates no drops',async()=>{
  const{dimension,player,base}=setup('minecraft:bookshelf');player.mode='Creative';const r=await place(player,base,'ipad_air_magic_keyboard');assert.equal(player.container.count(r.definition),1);
  state.breakBlock({player,block:base,cancel:false});await tick();assert.equal(saved().length,0);assert.equal(dimension.drops.length,0);assert.equal(base.typeId,'minecraft:bookshelf');
});
