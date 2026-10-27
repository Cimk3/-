import { electronicsById } from './electronics-catalog.js';
/** Entity model +Z faces world -Z at yaw=0. Block and poster yaw are separate. */
export function screenYaw(definition, center, player, lookYaw) {
    const d = electronicsById.get(definition);
    if (!d?.screenFront)
        return undefined;
    const dx = player.x - center.x, dz = player.z - center.z;
    const target = Math.hypot(dx, dz) < .0001 ? lookYaw + 180 : Math.atan2(-dx, dz) * 180 / Math.PI;
    return ((target - d.screenFront + 180) % 360 + 360) % 360 - 180;
}
/** World-space normal of a screen, used by orientation tests and previews. */
export function screenNormal(yaw, front = 180) { const t = (yaw + front) * Math.PI / 180; return { x: -Math.sin(t), z: Math.cos(t) }; }
