const prop = (key, zh, en, group = 'laboratory_equipment', height = 1) => ({ key, zh, en, group, height, wallOnly: false, placementFront: 0 });
export const patch080Props = [
    prop('laboratory_centrifuge', '离心机', 'Laboratory Centrifuge'),
    prop('laboratory_incubator', '恒温培养箱', 'Laboratory Incubator', undefined, 2),
    prop('laboratory_cloud_storage_array', '云储存阵列', 'Laboratory Cloud Storage Array', undefined, 2),
    prop('open_reel_tape_recorder', '开盘磁带录放机', 'Open Reel Tape Recorder', undefined, 2),
    prop('laboratory_radio_station', '无线电台', 'Laboratory Radio Station'),
    prop('ceiling_arm_display_2x1', '吸顶悬臂显示器 2×1', 'Ceiling Arm Display 2x1', undefined, 2),
    prop('digital_oscilloscope', '数字示波器', 'Digital Oscilloscope'),
    prop('pipette_rack_set', '移液器架套装', 'Pipette Rack Set'),
    prop('laboratory_dual_monitor_set', '双屏显示器套装', 'Laboratory Dual Monitor Set', 'electronics'),
    prop('template_ai_triple_monitor_set', '三联屏工作台', 'TemplateAI Triple Monitor Set', 'electronics'),
    prop('portrait_paper_monitor', '45°竖屏显示器', '45 Degree Portrait Paper Monitor', 'electronics', 2)
];
export const ceilingDisplayKey = 'ceiling_arm_display_2x1';
export const patch080ById = new Map(patch080Props.map(d => ['mcpe_food:' + d.key, d]));
export const laboratoryKeys = patch080Props.filter(d => d.group === 'laboratory_equipment').map(d => d.key);
export const patch080Screens = new Set(['laboratory_centrifuge', 'laboratory_incubator', 'laboratory_cloud_storage_array', 'laboratory_radio_station', 'digital_oscilloscope', 'laboratory_dual_monitor_set', 'template_ai_triple_monitor_set']);
