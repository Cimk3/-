import { BlockPermutation, GameMode, ItemStack, system, world } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { compatibleVessels, foodById, foodByServing, id, servingKey, vesselByKey } from './catalog.js';
import { adById, adSize, advertisements, surfaceIndex, tableItemById, tray, trayFoods } from './decor-catalog.js';
import { electronicsById } from './electronics-catalog.js';
import { refrigeratorById } from './appliance-catalog.js';
import { screenYaw } from './device-facing.js';
import { planInsert, planServe } from './inventory.js';
import { isWallSupport, surfaceHeight } from './supports.js';
let io;
const PREFIX = 'mcpe_food:decor:', records = new Map(), locks = new Set(), cooldowns = new Map();
const yaw = { north: 0, east: -90, south: 180, west: 90 };
const normals = { north: { x: 0, y: 0, z: -1 }, south: { x: 0, y: 0, z: 1 }, east: { x: 1, y: 0, z: 0 }, west: { x: -1, y: 0, z: 0 } };
const rights = { north: { x: -1, y: 0, z: 0 }, south: { x: 1, y: 0, z: 0 }, east: { x: 0, y: 0, z: 1 }, west: { x: 0, y: 0, z: -1 } };
const add = (a, b, n = 1) => ({ x: a.x + b.x * n, y: a.y + b.y * n, z: a.z + b.z * n });
const same = (a, b) => a.x === b.x && a.y === b.y && a.z === b.z;
const copy = (r) => JSON.parse(JSON.stringify(r));
const dim = (r) => world.getDimension(r.dimension.replace(/^minecraft:/, ''));
const anchor = (r) => add(r.support, { x: 0, y: 1, z: 0 });
const safeBlock = (r, p = r.support) => { try {
    return dim(r).getBlock(p);
}
catch {
    return undefined;
} };
const empty = (b) => b?.typeId === 'minecraft:air';
const isCreative = (p) => p.getGameMode() === GameMode.Creative;
const recordForSupport = (dimension, p) => [...records.values()].find(r => r.kind !== 'ad' && r.dimension === dimension && same(r.support, p));
const storageKey = (r) => PREFIX + r.uid;
function save(r) { world.setDynamicProperty(storageKey(r), JSON.stringify(r)); records.set(r.uid, r); }
function unique() { const n = Number(world.getDynamicProperty('mcpe_food:decor_serial') ?? 0) + 1; world.setDynamicProperty('mcpe_food:decor_serial', n); return `d${n}`; }
function near(p, r) {
    if (!p.isValid || p.dimension.id !== r.dimension)
        return false;
    if (r.kind === 'ad') {
        const ad = advertisements.find(a => a.key === r.art);
        if (!ad)
            return false;
        const [w, h] = adSize(ad, r.size ?? 0), right = rights[r.direction], normal = normals[r.direction];
        const d = { x: p.location.x - r.support.x - .5, y: p.location.y - r.support.y, z: p.location.z - r.support.z - .5 };
        const horizontal = d.x * right.x + d.z * right.z, vertical = d.y, depth = d.x * normal.x + d.z * normal.z;
        return Math.hypot(Math.max(-.5 - horizontal, 0, horizontal - (w - .5)), Math.max(-vertical, 0, vertical - h), depth) < 7;
    }
    return Math.hypot(p.location.x - r.support.x - .5, p.location.y - r.support.y - 1, p.location.z - r.support.z - .5) < 7;
}
function click(p, key) { const k = p.id + key, last = cooldowns.get(k) ?? -100; if (system.currentTick - last < 6)
    return false; cooldowns.set(k, system.currentTick); return true; }
function assertCurrent(p, r) {
    const now = records.get(r.uid);
    return !!now && now.revision === r.revision && near(p, now) && surfaceValid(now) === true;
}
/** undefined means unloaded; it must never be treated as missing support. */
function surfaceValid(r) {
    if (r.kind === 'ad')
        return adFits(r);
    const b = safeBlock(r);
    if (!b)
        return undefined;
    if (r.kind === 'appliance') {
        if (surfaceHeight(b) !== 1)
            return false;
        for (const [i, p] of applianceCells(r).entries()) {
            const part = safeBlock(r, p);
            if (!part)
                return undefined;
            if (part.typeId !== (i === 0 ? r.definition : r.definition + '_upper') || part.permutation.getState('minecraft:cardinal_direction') !== r.direction)
                return false;
        }
        return true;
    }
    if (!surfaceHeight(b))
        return false;
    const above = safeBlock(r, anchor(r));
    if (!above)
        return undefined;
    return r.native ? above.typeId === id(tray.key) : empty(above);
}
function posterCells(r) {
    const ad = advertisements.find(a => a.key === r.art);
    if (!ad)
        return [];
    const [w, h] = adSize(ad, r.size ?? 0), right = rights[r.direction], cells = [];
    for (let x = 0; x < w; x++)
        for (let y = 0; y < h; y++)
            cells.push(add(add(r.support, right, x), { x: 0, y: 1, z: 0 }, y));
    return cells;
}
export function adFits(r) {
    const cells = posterCells(r), n = normals[r.direction];
    if (!cells.length || !n)
        return false;
    for (const p of cells) {
        const wall = safeBlock(r, p), front = safeBlock(r, add(p, n));
        if (!wall || !front)
            return undefined;
        if (!isWallSupport(wall) || !empty(front))
            return false;
    }
    const set = new Set(cells.map(p => `${p.x},${p.y},${p.z}`));
    for (const other of records.values())
        if (other.kind === 'ad' && other.uid !== r.uid && other.dimension === r.dimension && other.direction === r.direction && posterCells(other).some(p => set.has(`${p.x},${p.y},${p.z}`)))
            return false;
    return true;
}
function visuals(r) { return dim(r).getEntities({ families: ['mcpe_food_display'] }).filter(e => e.getDynamicProperty('mcpe_food:owner') === r.uid); }
function visual(r, type, part, index, position) {
    const existing = visuals(r).filter(e => e.getDynamicProperty('mcpe_food:part') === part && e.typeId === type);
    const found = existing.shift(), entity = found ?? dim(r).spawnEntity(type, position);
    for (const duplicate of existing)
        duplicate.remove();
    if (entity.getDynamicProperty('mcpe_food:owner') !== r.uid)
        entity.setDynamicProperty('mcpe_food:owner', r.uid);
    if (entity.getDynamicProperty('mcpe_food:part') !== part)
        entity.setDynamicProperty('mcpe_food:part', part);
    if (entity.getProperty('mcpe_food:index') !== index)
        entity.setProperty('mcpe_food:index', index);
    if (type === 'mcpe_food:surface_display') {
        const device = electronicsById.get(r.definition);
        const shape = device ? device.key : r.kind === 'tray' || /chopsticks|table_knife|fork|spoon/.test(r.definition) ? 'flat' : /wine_glass|hotpot|bottle/.test(r.definition) ? 'tall' : 'medium';
        if (entity.getDynamicProperty('mcpe_food:shape') !== shape) {
            entity.triggerEvent(`mcpe_food:shape_${shape}`);
            entity.setDynamicProperty('mcpe_food:shape', shape);
        }
    }
    if (r.kind === 'ad' && entity.getProperty('mcpe_food:size') !== (r.size ?? 0))
        entity.setProperty('mcpe_food:size', r.size ?? 0);
    const facing = r.yaw ?? yaw[r.direction] ?? 0;
    if (!found || !same(entity.location, position) || entity.getDynamicProperty('mcpe_food:yaw') !== facing) {
        entity.teleport(position, { rotation: { x: 0, y: facing } });
        entity.setDynamicProperty('mcpe_food:yaw', facing);
    }
    return entity;
}
export function synchronize(r) {
    if (surfaceValid(r) !== true)
        return;
    if (r.kind === 'appliance')
        return;
    const wanted = new Set();
    if (r.kind === 'ad') {
        const ad = advertisements.find(a => a.key === r.art);
        const [w] = adSize(ad, r.size ?? 0), n = normals[r.direction], right = rights[r.direction];
        const p = add(add({ x: r.support.x + .5, y: r.support.y, z: r.support.z + .5 }, right, (w - 1) / 2), n, .521);
        visual(r, 'mcpe_food:advert_display', 'poster', advertisements.indexOf(ad), p);
        wanted.add('poster');
    }
    else {
        const height = surfaceHeight(safeBlock(r)), p = { x: r.support.x + .5, y: r.support.y + height, z: r.support.z + .5 };
        if (!r.native) {
            const index = surfaceIndex.get(r.definition);
            if (index === undefined)
                throw new Error('Unknown surface visual');
            visual(r, 'mcpe_food:surface_display', 'base', index, p);
            wanted.add('base');
        }
        if (r.kind === 'tray')
            for (let slot = 0; slot < 3; slot++) {
                const key = r.slots[slot];
                if (!key)
                    continue;
                const index = trayFoods.findIndex(f => id(f.key) === key);
                if (index < 0)
                    throw new Error('Unknown tray food');
                const angle = (yaw[r.direction] ?? 0) * Math.PI / 180, offset = (slot - 1) * 4.6 / 16;
                visual(r, 'mcpe_food:tray_food_display', `slot${slot}`, index, { x: p.x + Math.cos(angle) * offset, y: p.y, z: p.z - Math.sin(angle) * offset });
                wanted.add(`slot${slot}`);
            }
    }
    for (const e of visuals(r))
        if (!wanted.has(String(e.getDynamicProperty('mcpe_food:part'))))
            e.remove();
}
function restore(c, before) { before.originals.forEach((s, i) => c.setItem(i, s)); }
function change(p, old, next, plan) {
    if (!plan.ok) {
        io.notify(p, '背包空间不足或手持物已变化。', 'Inventory full or held item changed.');
        return false;
    }
    const c = io.inventory(p);
    if (!c || locks.has(old.uid) || !assertCurrent(p, old))
        return false;
    const before = io.snapshot(c);
    locks.add(old.uid);
    try {
        io.commit(c, before, plan.slots);
        save(next);
        synchronize(next);
        return true;
    }
    catch (error) {
        restore(c, before);
        save(old);
        try {
            synchronize(old);
        }
        catch { }
        throw error;
    }
    finally {
        locks.delete(old.uid);
    }
}
function drops(r) {
    if (r.kind === 'ad')
        return [id(r.art)];
    if (r.kind === 'tray')
        return [id(tray.key), ...r.slots.filter((s) => !!s)];
    const serving = foodByServing.get(r.definition);
    return serving ? [id(serving.vessel.key), id(serving.food.key)] : [r.definition];
}
export function removeDecor(requested, drop) {
    const r = records.get(requested.uid);
    if (!r || locks.has(r.uid))
        return;
    locks.add(r.uid);
    const spawned = [], changed = [];
    try {
        if (r.kind === 'appliance') {
            const cells = applianceCells(r);
            for (const child of [...records.values()])
                if (child.uid !== r.uid && child.dimension === r.dimension && ((child.kind !== 'ad' && cells.some(p => same(p, child.support))) || (child.kind === 'ad' && posterCells(child).some(p => cells.some(c => same(p, c))))))
                    removeDecor(child, drop);
        }
        if (drop)
            for (const key of drops(r))
                spawned.push(dim(r).spawnItem(new ItemStack(key), { x: r.support.x + .5, y: r.support.y + 1, z: r.support.z + .5 }));
        if (r.kind === 'appliance')
            for (const [i, p] of applianceCells(r).entries()) {
                const block = safeBlock(r, p);
                if (block?.typeId === (i === 0 ? r.definition : r.definition + '_upper')) {
                    changed.push({ block, permutation: block.permutation });
                    block.setPermutation(BlockPermutation.resolve('minecraft:air'));
                }
            }
        if (r.native && safeBlock(r, anchor(r))?.typeId === id(tray.key))
            safeBlock(r, anchor(r)).setPermutation(BlockPermutation.resolve('minecraft:air'));
        world.setDynamicProperty(storageKey(r));
        records.delete(r.uid);
        for (const e of visuals(r))
            e.remove();
    }
    catch (error) {
        for (const e of spawned)
            if (e.isValid)
                e.remove();
        for (const c of changed)
            c.block.setPermutation(c.permutation);
        if (r.kind === 'tray' && r.native && safeBlock(r, anchor(r)))
            safeBlock(r, anchor(r)).setPermutation(BlockPermutation.resolve(id(tray.key), { 'minecraft:cardinal_direction': r.direction }));
        save(r);
        throw error;
    }
    finally {
        locks.delete(r.uid);
    }
}
async function trayMenu(p, r) {
    if (!click(p, r.uid))
        return;
    const token = io.sessions.begin(p.id);
    if (token === undefined)
        return;
    const c = io.inventory(p), slotIndex = p.selectedSlotIndex, hand = c?.getItem(slotIndex), food = hand && foodById.get(hand.typeId), english = p.hasTag('food_english');
    try {
        if (hand && !trayFoods.some(f => id(f.key) === hand.typeId)) {
            io.notify(p, '托盘只接受盘装料理和盘装展示配菜。', 'This tray accepts plate dishes and display platters.');
            return;
        }
        const form = new ActionFormData().title(english ? 'Three Dish Tray' : '三菜连体托盘').body(hand ? (english ? 'Select an empty plate.' : '选择一个空盘盛装。') : (english ? 'Select a dish to take.' : '选择一道料理取回。'));
        for (let i = 0; i < 3; i++) {
            const entry = r.slots[i], info = entry && foodById.get(entry);
            form.button(`${(english ? ['Left', 'Middle', 'Right'] : ['左盘', '中盘', '右盘'])[i]} · ${info ? (english ? info.en : info.zh) : (english ? 'Empty' : '空盘')}`);
        }
        const response = await form.show(p), i = response.selection;
        if (response.canceled || i === undefined || i < 0 || i > 2 || !io.sessions.claim(p.id, token) || !assertCurrent(p, r))
            return;
        if (p.selectedSlotIndex !== slotIndex)
            return;
        const current = c?.getItem(slotIndex);
        if (current?.typeId !== hand?.typeId)
            return;
        const next = copy(r);
        next.revision++;
        let plan;
        if (food && hand) {
            if (r.slots[i])
                return;
            plan = planServe(io.snapshot(c).slots, slotIndex, hand.typeId);
            next.slots[i] = hand.typeId;
        }
        else {
            const item = r.slots[i];
            if (!item)
                return;
            plan = planInsert(io.snapshot(c).slots, item, 1, new ItemStack(item).maxAmount);
            next.slots[i] = null;
        }
        change(p, r, next, plan);
    }
    finally {
        io.sessions.finish(p.id, token);
    }
}
function surfaceInteract(p, r) {
    if (!click(p, r.uid) || !assertCurrent(p, r))
        return;
    const c = io.inventory(p);
    if (!c)
        return;
    const hand = c.getItem(p.selectedSlotIndex), served = foodByServing.get(r.definition), next = copy(r);
    next.revision++;
    if (served) {
        if (hand)
            return;
        next.definition = id(served.vessel.key);
        change(p, r, next, planInsert(io.snapshot(c).slots, id(served.food.key), 1, new ItemStack(id(served.food.key)).maxAmount));
        return;
    }
    const vessel = vesselByKey.get(r.definition.replace('mcpe_food:', '')), food = hand && foodById.get(hand.typeId);
    if (!vessel || !food || !compatibleVessels(food).some(v => v.key === vessel.key))
        return;
    next.definition = id(servingKey(food, vessel.key));
    change(p, r, next, planServe(io.snapshot(c).slots, p.selectedSlotIndex, hand.typeId));
}
async function posterMenu(p, r, placing = false) {
    if (!placing && !click(p, r.uid))
        return;
    const token = io.sessions.begin(p.id);
    if (token === undefined)
        return;
    const ad = advertisements.find(a => a.key === r.art), c = io.inventory(p), selected = p.selectedSlotIndex, english = p.hasTag('food_english');
    if (!c) {
        io.sessions.finish(p.id, token);
        return;
    }
    try {
        const form = new ActionFormData().title(english ? ad.en : ad.zh).body(english ? 'Choose size; the clicked wall block is the lower-left anchor.' : '选择尺寸；点击的墙面方块是画面左下角。');
        for (let s = 0; s < 3; s++) {
            const [w, h] = adSize(ad, s);
            form.button(`${(english ? ['Small', 'Medium', 'Large'] : ['小', '中', '大'])[s]} · ${w}×${h}`);
        }
        if (!placing)
            form.button(english ? 'Take back' : '收回广告画');
        const response = await form.show(p), choice = response.selection;
        if (response.canceled || choice === undefined || !io.sessions.claim(p.id, token) || !near(p, r))
            return;
        if (!placing && !assertCurrent(p, r))
            return;
        if (choice === 3 && !placing) {
            const plan = planInsert(io.snapshot(c).slots, id(ad.key), 1, new ItemStack(id(ad.key)).maxAmount);
            if (!plan.ok) {
                io.notify(p, '背包已满，广告画保持原状。', 'Inventory full; the poster stays.');
                return;
            }
            const before = io.snapshot(c);
            try {
                io.commit(c, before, plan.slots);
                removeDecor(r, false);
            }
            catch (error) {
                restore(c, before);
                throw error;
            }
            return;
        }
        if (choice < 0 || choice > 2)
            return;
        const next = copy(r);
        next.size = choice;
        next.revision++;
        if (adFits(next) !== true) {
            io.notify(p, '背墙、前方空间不足，或与其他广告画重叠。', 'Missing backing, blocked space, or overlapping poster.');
            return;
        }
        if (placing) {
            if (p.selectedSlotIndex !== selected || c.getItem(selected)?.typeId !== id(ad.key))
                return;
            const before = io.snapshot(c), plan = isCreative(p) ? { ok: true, slots: before.slots } : planServe(before.slots, selected, id(ad.key));
            if (!plan.ok)
                return;
            try {
                io.commit(c, before, plan.slots);
                save(next);
                synchronize(next);
            }
            catch (error) {
                restore(c, before);
                if (records.has(next.uid))
                    removeDecor(next, false);
                throw error;
            }
        }
        else
            change(p, r, next, { ok: true, slots: io.snapshot(c).slots });
    }
    finally {
        io.sessions.finish(p.id, token);
    }
}
function direction(p) { const angle = ((p.getRotation().y % 360) + 360) % 360; return angle < 45 || angle >= 315 ? 'south' : angle < 135 ? 'west' : angle < 225 ? 'north' : 'east'; }
function createSurface(p, support, definition) {
    const height = surfaceHeight(support), c = io.inventory(p);
    if (!height || !c || recordForSupport(support.dimension.id, support.location))
        return;
    const target = support.dimension.getBlock(add(support.location, { x: 0, y: 1, z: 0 }));
    if (!empty(target))
        return;
    const r = { version: 1, uid: unique(), revision: 0, dimension: support.dimension.id, support: { ...support.location }, kind: definition === id(tray.key) ? 'tray' : 'surface', definition, direction: direction(p), native: definition === id(tray.key) && height === 1, slots: [null, null, null] };
    r.yaw = screenYaw(definition, { x: support.location.x + .5, z: support.location.z + .5 }, p.location, p.getRotation().y);
    if (!near(p, r))
        return;
    const before = io.snapshot(c), plan = isCreative(p) ? { ok: true, slots: before.slots } : planServe(before.slots, p.selectedSlotIndex, definition);
    if (!plan.ok)
        return;
    // Publish the owner first: an engine onPlace callback must reuse this same
    // instance rather than creating a second persistent tray at the same anchor.
    try {
        save(r);
        if (r.native)
            target.setPermutation(BlockPermutation.resolve(definition, { 'minecraft:cardinal_direction': r.direction }));
        io.commit(c, before, plan.slots);
        synchronize(r);
    }
    catch (error) {
        restore(c, before);
        if (records.has(r.uid))
            removeDecor(r, false);
        if (r.native)
            target.setPermutation(BlockPermutation.resolve('minecraft:air'));
        throw error;
    }
}
export function nativeTray(block) {
    const support = block.below(), previous = recordForSupport(block.dimension.id, support.location);
    if (previous)
        return previous;
    const r = { version: 1, uid: unique(), revision: 0, dimension: block.dimension.id, support: { ...support.location }, kind: 'tray', definition: id(tray.key), direction: String(block.permutation.getState('minecraft:cardinal_direction') ?? 'north'), native: true, slots: [null, null, null] };
    save(r);
    return r;
}
export function applianceCells(r) { return Array.from({ length: refrigeratorById.get(r.definition)?.height ?? 1 }, (_, i) => add(r.support, { x: 0, y: 1, z: 0 }, i + 1)); }
function createAppliance(p, support, definition) {
    const info = refrigeratorById.get(definition), c = io.inventory(p);
    if (!info || !c || surfaceHeight(support) !== 1 || recordForSupport(support.dimension.id, support.location))
        return;
    const r = { version: 1, uid: unique(), revision: 0, dimension: support.dimension.id, support: { ...support.location }, kind: 'appliance', definition, direction: direction(p), native: false, slots: [] };
    if (!near(p, r))
        return;
    const blocks = applianceCells(r).map(pos => safeBlock(r, pos));
    if (blocks.some(b => !empty(b)))
        return;
    if ([...records.values()].some(other => other.kind === 'ad' && other.dimension === r.dimension && posterCells(other).some(wall => applianceCells(r).some(pos => same(pos, add(wall, normals[other.direction]))))))
        return;
    const before = io.snapshot(c), plan = isCreative(p) ? { ok: true, slots: before.slots } : planServe(before.slots, p.selectedSlotIndex, definition);
    if (!plan.ok)
        return;
    const original = blocks.map(b => b.permutation);
    try {
        save(r);
        blocks.forEach((b, i) => b.setPermutation(BlockPermutation.resolve(i === 0 ? definition : definition + '_upper', { 'minecraft:cardinal_direction': r.direction })));
        io.commit(c, before, plan.slots);
    }
    catch (error) {
        restore(c, before);
        blocks.forEach((b, i) => b.setPermutation(original[i]));
        world.setDynamicProperty(storageKey(r));
        records.delete(r.uid);
        throw error;
    }
}
/** Tick recovery for commands/orphan helper parts; ordinary placement publishes its owner first. */
export function applianceTick(block) {
    const owned = [...records.values()].find(r => r.kind === 'appliance' && r.dimension === block.dimension.id && applianceCells(r).some(p => same(p, block.location)));
    if (owned) {
        if (surfaceValid(owned) === false)
            removeDecor(owned, true);
        return;
    }
    if (block.typeId.endsWith('_upper')) {
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
        return;
    }
    const info = refrigeratorById.get(block.typeId), support = block.below();
    if (!info || !support)
        return;
    const r = { version: 1, uid: unique(), revision: 0, dimension: block.dimension.id, support: { ...support.location }, kind: 'appliance', definition: block.typeId, direction: String(block.permutation.getState('minecraft:cardinal_direction') ?? 'north'), native: false, slots: [] };
    if (surfaceHeight(support) !== 1) {
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
        return;
    }
    const upper = info.height === 2 ? safeBlock(r, applianceCells(r)[1]) : undefined;
    if (info.height === 2 && !upper)
        return;
    if (upper && !empty(upper)) {
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
        return;
    }
    save(r);
    if (upper)
        upper.setPermutation(BlockPermutation.resolve(r.definition + '_upper', { 'minecraft:cardinal_direction': r.direction }));
}
export function migrateLowSurface(block) {
    const below = block.below();
    if (!below || surfaceHeight(below) !== .5)
        return;
    const old = block.permutation, definition = block.typeId;
    if (!surfaceIndex.has(definition))
        return;
    const existing = recordForSupport(block.dimension.id, below.location);
    const r = existing ?? { version: 1, uid: unique(), revision: 0, dimension: block.dimension.id, support: { ...below.location }, kind: definition === id(tray.key) ? 'tray' : 'surface', definition, direction: String(old.getState('minecraft:cardinal_direction') ?? 'north'), native: false, slots: [null, null, null] };
    const next = { ...copy(r), native: false, revision: r.revision + 1 };
    try {
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
        save(next);
        synchronize(next);
    }
    catch (error) {
        block.setPermutation(old);
        if (existing)
            save(existing);
        else {
            world.setDynamicProperty(storageKey(next));
            records.delete(next.uid);
        }
        throw error;
    }
}
function posterAt(block, face) { return [...records.values()].find(r => r.kind === 'ad' && r.dimension === block.dimension.id && r.direction === face && posterCells(r).some(p => same(p, block.location))); }
function run(p, work) { system.run(() => { Promise.resolve().then(work).catch(error => { console.warn(`[Food & Table] decor: ${String(error)}`); if (p.isValid)
    io.notify(p, '操作未完成，请重试。', 'Operation could not complete; please retry.'); }); }); }
export function handleDecorBlock(event) {
    const p = event.player, block = event.block, face = String(event.blockFace).toLowerCase(), c = io.inventory(p), hand = c?.getItem(p.selectedSlotIndex), ad = hand && adById.get(hand.typeId);
    const poster = posterAt(block, face);
    if (hand && refrigeratorById.has(hand.typeId) && face === 'up') {
        event.cancel = true;
        if (event.isFirstEvent) {
            const definition = hand.typeId;
            run(p, () => { if (io.inventory(p)?.getItem(p.selectedSlotIndex)?.typeId === definition)
                createAppliance(p, block, definition); });
        }
        return true;
    }
    if (ad && normals[face]) {
        event.cancel = true;
        if (event.isFirstEvent) {
            const r = { version: 1, uid: '', revision: 0, dimension: block.dimension.id, support: { ...block.location }, kind: 'ad', definition: id(ad.key), direction: face, native: false, slots: [], art: ad.key, size: 0 };
            run(p, () => { r.uid = unique(); return posterMenu(p, r, true); });
        }
        return true;
    }
    if (poster) {
        event.cancel = true;
        if (event.isFirstEvent && !hand)
            run(p, () => posterMenu(p, copy(poster)));
        return true;
    }
    if (block.typeId === id(tray.key)) {
        event.cancel = true;
        if (event.isFirstEvent)
            run(p, () => trayMenu(p, copy(nativeTray(block))));
        return true;
    }
    if (hand && tableItemById.has(hand.typeId) && face === 'up' && recordForSupport(block.dimension.id, block.location)) {
        event.cancel = true;
        return true;
    }
    if (p.isSneaking && hand && tableItemById.has(hand.typeId) && !electronicsById.has(hand.typeId) && hand.typeId !== id(tray.key) && ['prep_counter', 'stove', 'oven', 'drink_counter'].some(k => block.typeId === id(k)))
        return false;
    if (hand && tableItemById.has(hand.typeId) && face === 'up' && surfaceHeight(block) > 0) {
        event.cancel = true;
        if (event.isFirstEvent) {
            const definition = hand.typeId;
            run(p, () => { if (io.inventory(p)?.getItem(p.selectedSlotIndex)?.typeId === definition)
                createSurface(p, block, definition); });
        }
        return true;
    }
    return false;
}
let cursor = 0;
export function reconcileDecor() {
    const all = [...records.values()];
    if (!all.length)
        return;
    for (let n = 0; n < Math.min(24, all.length); n++) {
        const r = all[cursor++ % all.length];
        if (!records.has(r.uid))
            continue;
        try {
            const valid = surfaceValid(r);
            if (valid === undefined)
                continue;
            if (r.native && surfaceHeight(safeBlock(r)) === .5 && safeBlock(r, anchor(r))?.typeId === id(tray.key)) {
                migrateLowSurface(safeBlock(r, anchor(r)));
                continue;
            }
            if (!valid) {
                removeDecor(r, true);
                continue;
            }
            synchronize(r);
        }
        catch (error) {
            console.warn(`[Food & Table] display reconciliation: ${String(error)}`);
        }
    }
}
export function loadDecorRecords() {
    records.clear();
    for (const key of world.getDynamicPropertyIds().filter(k => k.startsWith(PREFIX))) {
        try {
            const r = JSON.parse(String(world.getDynamicProperty(key)));
            if (r.version === 1 && r.uid && r.support)
                records.set(r.uid, r);
        }
        catch {
            console.warn(`[Food & Table] invalid decor record ${key}`);
        }
    }
}
export function installDecor(adapter) {
    io = adapter;
    system.run(loadDecorRecords);
    world.beforeEvents.playerInteractWithEntity.subscribe(event => {
        if (!event.target.isValid || !event.target.typeId.startsWith('mcpe_food:'))
            return;
        const owner = event.target.getDynamicProperty('mcpe_food:owner'), r = records.get(String(owner));
        if (!r)
            return;
        event.cancel = true;
        run(event.player, () => r.kind === 'tray' ? trayMenu(event.player, copy(r)) : r.kind === 'ad' ? posterMenu(event.player, copy(r)) : surfaceInteract(event.player, copy(r)));
    });
    world.beforeEvents.playerBreakBlock.subscribe(event => {
        const candidates = [...records.values()].filter(r => r.dimension === event.block.dimension.id && ((r.kind === 'appliance' && applianceCells(r).some(p => same(p, event.block.location))) || (r.native && same(anchor(r), event.block.location)) || (r.kind === 'ad' && posterCells(r).some(p => same(p, event.block.location)))));
        const supportLost = candidates.length ? [] : [...records.values()].filter(r => r.kind !== 'ad' && r.dimension === event.block.dimension.id && same(r.support, event.block.location));
        if (!candidates.length && !supportLost.length)
            return;
        if (candidates.length)
            event.cancel = true;
        run(event.player, () => { for (const r of [...candidates, ...supportLost])
            if (near(event.player, r))
                removeDecor(r, !isCreative(event.player)); });
    });
    world.afterEvents.entityHitEntity.subscribe(event => {
        if (!event.hitEntity.isValid || event.damagingEntity.typeId !== 'minecraft:player')
            return;
        const owner = event.hitEntity.getDynamicProperty('mcpe_food:owner'), r = records.get(String(owner));
        if (r)
            removeDecor(r, !isCreative(event.damagingEntity));
    });
    world.afterEvents.entityLoad.subscribe(({ entity }) => {
        if (!entity.typeId.startsWith('mcpe_food:'))
            return;
        system.run(() => { if (!entity.isValid)
            return; const owner = entity.getDynamicProperty('mcpe_food:owner'), r = records.get(String(owner)); if (r) {
            try {
                synchronize(r);
            }
            catch { }
        }
        else if (owner && entity.isValid)
            entity.remove(); });
    });
    system.runInterval(reconcileDecor, 20);
    system.runInterval(() => { for (const [k, t] of cooldowns)
        if (system.currentTick - t > 200)
            cooldowns.delete(k); }, 200);
}
