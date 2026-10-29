/** Inventory categories are independent of append-only saved visual indices. */
const prop = (key, zh, en, group, height = 1) => ({ key, zh, en, group, height, wallOnly: false, placementFront: 0 });
export const patch073Props = [
    prop('government_service_kiosk', '自助政务服务终端', 'Government Service Kiosk', 'government_equipment', 2),
    prop('government_id_reader', '身份证读卡器', 'Government ID Reader', 'government_equipment'),
    prop('government_fingerprint_scanner', '指纹采集器', 'Fingerprint Scanner', 'government_equipment'),
    prop('government_signature_pad', '电子签名板', 'Electronic Signature Pad', 'government_equipment'),
    prop('government_document_scanner', '高速文档扫描仪', 'High Speed Document Scanner', 'government_equipment'),
    prop('government_stamp_set', '印章与印台套装', 'Stamp and Ink Pad Set', 'government_equipment'),
    prop('chinese_five_sauce_set', '五碟小料蘸酱组合（展示）', 'Five Chinese Dipping Sauces (Display)', 'chinese'),
    prop('ft_b1_open', 'FT商务本（FT-B1）', 'FT-B1 Business Laptop', 'electronics'),
    prop('ft_ideabook_p1_open', 'FT创作本（FT-Ideabook-P1）', 'FT-Ideabook-P1 Creator Laptop', 'electronics'),
    prop('ft_master_open', 'FT游戏本（FT-Master）', 'FT-Master Gaming Laptop', 'electronics')
];
export const patch073ById = new Map(patch073Props.map(d => ['mcpe_food:' + d.key, d]));
export const governmentLegacyKeys = ['ft_government_desktop', 'ft_government_all_in_one', 'ft_government_ultrabook_open', 'government_queue_screen', 'upright_archive_cabinet'];
export const governmentKeys = [...governmentLegacyKeys, ...patch073Props.filter(d => d.group === 'government_equipment').map(d => d.key)];
export const creativeGroup = (key, fallback) => governmentLegacyKeys.includes(key) ? 'government_equipment' : fallback;
export const patch073Screens = new Set(['government_service_kiosk', 'government_id_reader', 'government_signature_pad', 'ft_b1_open', 'ft_ideabook_p1_open', 'ft_master_open']);
export const saucePositions = [[-4.5, -2.7], [0, -2.7], [4.5, -2.7], [-2.3, 2.5], [2.3, 2.5]];
