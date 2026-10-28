/** Bake the wall-only front correction; no saved yaw or global device basis changes.
 * The client feedback establishes local -Z as the wall-facing outward convention
 * for north-facing native entities. Runtime derives the native display yaw
 * from the unchanged saved wall direction. Back is rebased to Z=0.
 */
export function wallFacingCubes(cubes){
 const back=Math.min(...cubes.map(c=>c.origin[2])),opposite={north:'south',south:'north',east:'west',west:'east',up:'up',down:'down'};
 return cubes.map(c=>{
  if(c.rotation?.some(v=>v!==0))throw Error('Wall correction requires baked geometry');
  return {...c,origin:[-c.origin[0]-c.size[0],c.origin[1],back-c.origin[2]-c.size[2]],
   ...(c.faces?{faces:c.faces.map(f=>opposite[f])}:{}),uv:Object.fromEntries(Object.entries(c.uv).map(([f,value])=>[opposite[f],value]))};
 });
}
