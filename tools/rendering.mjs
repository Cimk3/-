/** Only custom resources: no vanilla particle, lighting or PBR fallback overrides. */
import { foods } from '../.build/catalog.js';
import { png } from './art.mjs';
import { textureKey } from './resource-safety.mjs';
const foodMap = new Map(foods.map(food => [food.key, food]));
export const BREAK_DUST = 'break_dust';
export function destructionParticles() {
  return { texture: textureKey(BREAK_DUST), tint_method: 'none', particle_count: 0 };
}
export function blockMaterial(key) {
  // All block color maps are opaque; empty glass is modeled with actual holes.
  return { texture: textureKey(key), render_method: 'opaque', ambient_occlusion: 1, face_dimming: true };
}
export function surfaceProfile(key, role) {
  const baseKey = key.replace(/_serving$/, ''), food = foodMap.get(baseKey);
  let metal = 0, rough = 180;
  if (role === 0 || role === 4) rough = 75;       // glazed porcelain
  if (role === 1) rough = 90;                     // celadon rim
  if (role === 2) rough = baseKey === 'mug' || food?.vessel === 'mug' ? 110 : 205;
  if (role === 3) { metal = 255; rough = 72; }     // cutlery, handles, tap
  if (role === 5) rough = 205;
  if (role >= 6 && role <= 8) {
    rough = food?.category === 'dessert' || ['rice','dough','noodles'].includes(baseKey) ? 200 : 155;
    if (food?.category === 'drink' && role === 6) rough = 42;
  }
  if (role === 9) rough = 175;                    // herbs and leaves
  if (role === 10) rough = 215;                   // crust and bread
  if (role === 11) rough = 190;
  if (role === 12) rough = 32;                    // glass frame
  if (/_crop_\d$/.test(baseKey) || /_seeds$/.test(baseKey)) { metal = 0; rough = 220; }
  if (baseKey === 'stove' && [5,6,7].includes(role)) { metal = 255; rough = role === 7 ? 125 : 95; }
  if (baseKey === 'oven' && role === 7) { metal = 255; rough = 105; }
  if (baseKey === 'oven' && role === 8) rough = 55;
  if (baseKey === 'prep_counter' && role === 7) rough = 205;
  if (baseKey === 'drink_counter' && role === 6) rough = 90;
  return [metal, 0, rough]; // No permanent emission from food or an unpowered stove.
}
export function merPixels(key, paletteLength) {
  const data = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const role = (Math.floor(y / 8) * 8 + Math.floor(x / 8)) % paletteLength;
    data.set([...surfaceProfile(key, role), 255], (y * 64 + x) * 4);
  }
  return data;
}
export const merAtlas = (key, paletteLength) => png(64, 64, merPixels(key, paletteLength));
export function blockTextureSet(key) {
  return { format_version: '1.21.30', 'minecraft:texture_set': { color: key, metalness_emissive_roughness: `${key}_mer` } };
}
export function itemTextureSet(key) {
  // Inventory art already contains isometric shading; keep the flat item matte.
  return { format_version: '1.21.30', 'minecraft:texture_set': { color: key, metalness_emissive_roughness: [0, 0, 205] } };
}
export function breakDustImage() {
  const data = new Uint8Array(8 * 8 * 4);
  for (let i = 0; i < 64; i++) data.set([211, 213, 203, 255], i * 4);
  return png(8, 8, data);
}
