/** Texture aliases merge globally across packs; resource_pack_name is not a namespace. */
export const textureKey = key => `mcpe_food_${key}`;
export const texturePath = (kind, key) => `textures/${kind}/mcpe_food/${key}`;
export function resourceViolations({terrain, icons, blockDefinitions, files, geometryIds = [], textureSets = [], renderControllers = [], entityIds = []}) {
  const problems = [];
  for (const [name, registry] of [['terrain', terrain], ['items', icons]]) {
    const kind = name === 'terrain' ? 'blocks' : 'items';
    for (const [key, entry] of Object.entries(registry)) {
      if (!/^mcpe_food_[a-z0-9_]+$/.test(key)) problems.push(`${name}: non-private texture key ${key}`);
      const paths = Array.isArray(entry.textures) ? entry.textures : [entry.textures];
      for (const p of paths) {
        if (typeof p !== 'string' || !new RegExp(`^textures/${kind}/mcpe_food/[a-z0-9_]+$`).test(p)) {
          problems.push(`${name}: non-private texture path ${String(p)}`);
        }
      }
    }
  }
  for (const key of Object.keys(blockDefinitions)) {
    if (key !== 'format_version' && !key.startsWith('mcpe_food:')) problems.push(`vanilla/foreign block override ${key}`);
  }
  for (const file of files) {
    if (file.startsWith('textures/') && !['textures/terrain_texture.json', 'textures/item_texture.json'].includes(file)
      && !/^textures\/(blocks|items|entity)\/mcpe_food\/[a-z0-9_]+\.(png|texture_set\.json)$/.test(file)) {
      problems.push(`non-private texture file ${file}`);
    }
    if (/^(materials|shaders|particles|pbr|lighting|atmospherics|color_grading|fogs|biomes)\//.test(file)) problems.push(`global render override ${file}`);
    if (/^(render_controllers|animations|entity|models\/entity)\//.test(file)&&!/^(render_controllers|animations|entity|models\/entity)\/mcpe_food\/[a-z0-9_.]+\.json$/.test(file))problems.push(`non-private entity resource ${file}`);
  }
  for (const identifier of geometryIds) {
    if (!identifier.startsWith('geometry.mcpe_food.')) problems.push(`non-private geometry ${identifier}`);
  }
  for (const {file, definition} of textureSets) {
    if (!/^textures\/(blocks|items|entity)\/mcpe_food\/[a-z0-9_]+\.texture_set\.json$/.test(file)) problems.push(`non-private texture set ${file}`);
    const set=definition['minecraft:texture_set'];
    for (const layer of Object.values(set ?? {})) {
      if (typeof layer === 'string' && !/^[a-z0-9_]+$/.test(layer)) problems.push(`external texture set reference ${file}: ${layer}`);
    }
  }
  for(const name of renderControllers)if(!name.startsWith('controller.render.mcpe_food.'))problems.push(`foreign render controller ${name}`);
  for(const name of entityIds)if(!name.startsWith('mcpe_food:'))problems.push(`foreign entity ${name}`);
  return problems;
}
