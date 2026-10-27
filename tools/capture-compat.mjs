/** Capture the generated release before changing catalog or generated packs. */
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {recipes,dishes} from '../.build/catalog.js';
const read=file=>JSON.parse(readFileSync(file,'utf8'));
const version=read('package.json').version;
const bp='packs/FoodAndTable_BP',rp='packs/FoodAndTable_RP';
const manifest=read(`${bp}/manifest.json`);
if(manifest.header.version.join('.')!==version)throw new Error('Build does not match source release');
const hashes=folder=>Object.fromEntries(readdirSync(folder).sort().map(file=>[file,createHash('sha256').update(readFileSync(`${folder}/${file}`)).digest('hex')]));
const data={version,items:[],blocks:[],uuids:{},loot:hashes(`${bp}/loot_tables/blocks`),crafting:hashes(`${bp}/recipes`),
  menuRecipes:recipes.map(({key,station,inputs,output,category})=>({key,station,inputs,output,category})),
  dishes:dishes.map(({key,category,vessel,edible})=>({key,category,vessel,edible})),
  functions:Object.fromEntries(readdirSync(`${bp}/functions/mcpe_food`).sort().map(file=>[file,readFileSync(`${bp}/functions/mcpe_food/${file}`,'utf8')])),
  cropStates:Object.fromEntries(readdirSync(`${bp}/blocks`).filter(f=>f.endsWith('_crop.json')).map(file=>[file,read(`${bp}/blocks/${file}`)['minecraft:block'].description.states]))};
for(const kind of['items','blocks'])data[kind]=readdirSync(`${bp}/${kind}`).sort().map(file=>read(`${bp}/${kind}/${file}`)[`minecraft:${kind.slice(0,-1)}`].description.identifier);
for(const folder of[bp,rp]){const m=read(`${folder}/manifest.json`);data.uuids[folder.split('/').at(-1)]=[m.header.uuid,...m.modules.map(x=>x.uuid)];}
writeFileSync(`tests/fixtures/v${version}.json`,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
console.log(`Captured ${version} IDs, UUIDs, recipes, drops, crop states and commands.`);
