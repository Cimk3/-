import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resourceViolations} from '../tools/resource-safety.mjs';
const clean = () => ({
  terrain: {mcpe_food_glass: {textures: 'textures/blocks/mcpe_food/glass'}},
  icons: {mcpe_food_bowl: {textures: 'textures/items/mcpe_food/bowl'}},
  blockDefinitions: {format_version: [1,1,0], 'mcpe_food:glass': {sound: 'glass'}},
  files: ['textures/terrain_texture.json','textures/item_texture.json','textures/blocks/mcpe_food/glass.png','textures/items/mcpe_food/bowl.png'],
  geometryIds: ['geometry.mcpe_food.glass']
});
test('private cup textures can coexist with vanilla glass and its original sound', () => {
  assert.deepEqual(resourceViolations(clean()), []);
});
test('rejects the exact glass texture alias collision reported in 0.1.0', () => {
  const data=clean();data.terrain={glass:{textures:'textures/blocks/mcpe_food/glass'}};
  assert.ok(resourceViolations(data).some(x=>x.includes('texture key glass')));
});
test('rejects vanilla glass file override even if its atlas alias is private', () => {
  const data=clean();data.terrain.mcpe_food_glass.textures='textures/blocks/glass';data.files.push('textures/blocks/glass.png');
  assert.ok(resourceViolations(data).some(x=>x.includes('non-private texture path')));
  assert.ok(resourceViolations(data).some(x=>x.includes('non-private texture file')));
});
test('protects vanilla bowl and other item icons as well as block textures', () => {
  const data=clean();data.icons={bowl:{textures:'textures/items/bowl'}};
  assert.ok(resourceViolations(data).some(x=>x.includes('items: non-private texture key bowl')));
});
test('rejects a vanilla block override, material replacement or vanilla geometry ID', () => {
  const data=clean();data.blockDefinitions['minecraft:glass']={textures:'mcpe_food_glass'};
  data.files.push('materials/terrain.material');data.geometryIds.push('geometry.glass');
  assert.equal(resourceViolations(data).length,3);
});
test('the generated resource pack contains only private assets and registrations', () => {
  const root=fileURLToPath(new URL('../packs/FoodAndTable_RP/',import.meta.url));
  const read=name=>JSON.parse(readFileSync(path.join(root,name),'utf8'));
  const tree=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?tree(path.join(dir,e.name)):[path.join(dir,e.name)]);
  const files=tree(root).map(f=>path.relative(root,f).split(path.sep).join('/'));
  const geometryIds=files.filter(f=>f.endsWith('.geo.json')).flatMap(f=>read(f)['minecraft:geometry'].map(g=>g.description.identifier));
  const errors=resourceViolations({terrain:read('textures/terrain_texture.json').texture_data,icons:read('textures/item_texture.json').texture_data,blockDefinitions:read('blocks.json'),files,geometryIds});
  assert.equal(errors.length,0,errors.slice(0,8).join('\n'));
});
