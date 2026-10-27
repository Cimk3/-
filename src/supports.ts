import {slabIds} from './slabs.js';
/** Explicit full-cube supports: stable API 2.0 has no Block.isSolid property.
 * The same list drives placement AND survival filters (including support loss).
 */
const woods = ["oak", "spruce", "birch", "jungle", "acacia", "dark_oak", "mangrove", "cherry", "pale_oak", "bamboo", "crimson", "warped"];
const colors = ["white", "orange", "magenta", "light_blue", "yellow", "lime", "pink", "gray", "light_gray", "cyan", "purple", "blue", "brown", "green", "red", "black"];
const base = ["stone", "cobblestone", "mossy_cobblestone", "smooth_stone", "stone_bricks", "mossy_stone_bricks", "cracked_stone_bricks", "chiseled_stone_bricks",
  "granite", "polished_granite", "diorite", "polished_diorite", "andesite", "polished_andesite", "deepslate", "cobbled_deepslate", "polished_deepslate", "deepslate_bricks", "deepslate_tiles",
  "blackstone", "polished_blackstone", "polished_blackstone_bricks", "brick_block", "mud_bricks", "packed_mud", "end_stone", "end_bricks", "obsidian", "crying_obsidian",
  "sandstone", "smooth_sandstone", "cut_sandstone", "red_sandstone", "smooth_red_sandstone", "cut_red_sandstone", "quartz_block", "smooth_quartz", "quartz_bricks",
  "iron_block", "gold_block", "diamond_block", "emerald_block", "copper_block", "netherite_block", "coal_block", "redstone_block", "lapis_block",
  "hardened_clay", "clay", "dirt", "grass_block", "coarse_dirt", "mud", "podzol", "mycelium", "dirt_with_roots", "glass", "tinted_glass",
  "bookshelf", "chiseled_bookshelf", "crafting_table", "furnace", "smoker", "blast_furnace", "melon_block", "pumpkin", "hay_block", "dried_kelp_block", "bone_block", "snow", "ice", "packed_ice", "blue_ice"];
export const supportBlocks = [...new Set([
  ...base,
  ...woods.map(w => `${w}_planks`),
  ...woods.filter(w => !["bamboo", "crimson", "warped"].includes(w)).map(w => `${w}_log`),
  "crimson_stem", "warped_stem", "bamboo_block",
  ...colors.flatMap(c => [`${c}_wool`, `${c}_concrete`, `${c}_terracotta`, `${c}_stained_glass`])
].map(k => `minecraft:${k}`)), ...["prep_counter", "stove", "oven", "drink_counter"].map(k => `mcpe_food:${k}`)];
const full=new Set<string>(supportBlocks),slabs=new Set<string>(slabIds);
export const placementSupports=[...new Set([...supportBlocks,...slabIds])];
export function surfaceHeight(block: {typeId:string;permutation:{getAllStates():Record<string,unknown>}} | undefined): number {
  if(!block)return 0;
  if(full.has(block.typeId))return 1;
  if(!slabs.has(block.typeId))return 0;
  if(block.typeId.includes('double'))return 1;
  const s=block.permutation.getAllStates();
  return s['minecraft:vertical_half']==='top'||s['top_slot_bit']===true?1:.5;
}
export const isWallSupport=(block: Parameters<typeof surfaceHeight>[0]): boolean=>!!block&&(full.has(block.typeId)||(slabs.has(block.typeId)&&block.typeId.includes('double')));
