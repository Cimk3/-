import {electronicsById} from './electronics-catalog.js';
export function cardinalYaw(value:number):number{return ((Math.round(value/90)*90+180)%360+360)%360-180;}
/** Entity model +Z faces world -Z at yaw=0. Block and poster yaw are separate. */
export function screenYaw(definition:string,center:{x:number;z:number},player:{x:number;z:number},lookYaw:number):number|undefined {
  const d=electronicsById.get(definition);if(d?.placementFront===undefined)return undefined;
  const dx=player.x-center.x,dz=player.z-center.z;
  const target=Math.hypot(dx,dz)<.0001?lookYaw+180:Math.atan2(-dx,dz)*180/Math.PI;
  return cardinalYaw(target-d.placementFront);
}
/** World-space normal of a screen, used by orientation tests and previews. */
export function screenNormal(yaw:number,front:number=180):{x:number;z:number}{const t=(yaw+front)*Math.PI/180;return{x:-Math.sin(t),z:Math.cos(t)};}
