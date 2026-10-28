/** Separate append-only patch batch: category membership never determines saved indices. */
export const patch071Props = [
    { key: 'supermarket_checkout', zh: '超市收款机一体套装', en: 'Supermarket Checkout Set', height: 1, wallOnly: false, group: 'electronics', placementFront: 0 },
    { key: 'gpu_single_fan', zh: '单风扇显卡', en: 'Single Fan Graphics Card', height: 1, wallOnly: false, group: 'ai_work_devices', placementFront: 0 },
    { key: 'gpu_dual_fan', zh: '双风扇显卡', en: 'Dual Fan Graphics Card', height: 1, wallOnly: false, group: 'ai_work_devices', placementFront: 0 },
    { key: 'gpu_triple_fan', zh: '三风扇显卡', en: 'Triple Fan Graphics Card', height: 1, wallOnly: false, group: 'ai_work_devices', placementFront: 0 }
];
export const patch071ById = new Map(patch071Props.map(d => ['mcpe_food:' + d.key, d]));
