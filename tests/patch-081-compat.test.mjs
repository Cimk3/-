import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {surfaceVisuals} from '../.build/decor-catalog.js';
import {clothingVisuals} from '../.build/patch-072-catalog.js';
import {digitalScreens,wallScreens} from '../.build/scenario-catalog.js';
const read=f=>JSON.parse(readFileSync(f)),bp='packs/FoodAndTable_BP';
test('0.8.1 changes no content, IDs, UUIDs, recipes, crops, command roster or display order',()=>{
 const old=read('tests/fixtures/v0.8.0.json'),order=read('tests/fixtures/v0.8.0-displays.json');
 for(const kind of ['items','blocks'])assert.deepEqual(readdirSync(`${bp}/${kind}`).sort().map(f=>read(`${bp}/${kind}/${f}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier),old[kind]);
 for(const [pack,uuids]of Object.entries(old.uuids)){const m=read(`packs/${pack}/manifest.json`);assert.deepEqual([m.header.uuid,...m.modules.map(v=>v.uuid)],uuids);assert.deepEqual(m.header.version,[0,8,1]);}
 for(const[f,body]of Object.entries(old.functions))if(f!=='build_info.mcfunction')assert.equal(readFileSync(`${bp}/functions/mcpe_food/${f}`,'utf8'),body);
 assert.deepEqual(surfaceVisuals.map(d=>d.key),order.surfaceKeys);assert.deepEqual(clothingVisuals,order.clothingVisuals);assert.deepEqual(digitalScreens,order.digitalScreens);assert.deepEqual(wallScreens,order.wallScreens);
 const build=read(`${bp}/mcpe_food_build.json`);assert.equal(build.build,'0.8.1-release.1');assert.deepEqual(build,read('packs/FoodAndTable_RP/mcpe_food_build.json'));
});
test('0.8.1 retains every 0.8.0 resource byte and block/item/recipe/loot definition',()=>{
 const old=read('tests/fixtures/v0.8.0-resource-digest.json');
 const tree=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?tree(d+'/'+e.name):[d+'/'+e.name]);
 const files=old.roots.flatMap(tree).filter(f=>!f.endsWith('/manifest.json')&&!f.endsWith('/mcpe_food_build.json')).sort(),digest=createHash('sha256');
 for(const f of files)digest.update(f+'\0'+createHash('sha256').update(readFileSync(f)).digest('hex')+'\n');
 assert.equal(files.length,old.files);assert.equal(digest.digest('hex'),old.sha256);
});
