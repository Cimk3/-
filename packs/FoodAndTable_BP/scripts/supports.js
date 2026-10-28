import { vanillaSurfaceClasses } from './vanilla-surfaces.js';
import { refrigeratorPartIds } from './appliance-catalog.js';
const own = ['prep_counter', 'stove', 'oven', 'drink_counter'].map(k => `mcpe_food:${k}`).concat(refrigeratorPartIds);
export const supportBlocks = [...Object.keys(vanillaSurfaceClasses).filter(k => vanillaSurfaceClasses[k].kind === 'full'), ...own];
const full = new Set(supportBlocks);
export const placementSupports = [...Object.keys(vanillaSurfaceClasses).filter(k => vanillaSurfaceClasses[k].kind !== 'excluded'), ...own];
export function surfaceHeight(block) {
    if (!block)
        return 0;
    if (full.has(block.typeId))
        return 1;
    if (vanillaSurfaceClasses[block.typeId]?.kind === 'stairs')
        return block.permutation.getAllStates()['upside_down_bit'] === true ? 1 : 0;
    if (vanillaSurfaceClasses[block.typeId]?.kind !== 'slab')
        return 0;
    const s = block.permutation.getAllStates();
    return s['minecraft:vertical_half'] === 'top' || s['top_slot_bit'] === true ? 1 : .5;
}
export const isWallSupport = (block) => !!block && full.has(block.typeId);
