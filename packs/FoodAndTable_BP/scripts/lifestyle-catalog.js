export const officeStationery = [
    { key: 'pen_holder', zh: '笔筒', en: 'Pen Holder', front: false },
    { key: 'notebook_open', zh: '打开笔记本', en: 'Open Notebook', front: true },
    { key: 'notebook_closed', zh: '合起笔记本', en: 'Closed Notebook', front: true },
    { key: 'document_stack', zh: '文件叠', en: 'Document Stack', front: true },
    { key: 'standing_binder', zh: '立式文件夹', en: 'Standing Binder', front: true },
    { key: 'stapler', zh: '订书机', en: 'Stapler', front: true },
    { key: 'tape_dispenser', zh: '胶带座', en: 'Tape Dispenser', front: true },
    { key: 'desk_organizer', zh: '桌面收纳架', en: 'Desk Organizer', front: true }
];
export const homeDecor = [
    { key: 'ceramic_vase', zh: '陶瓷空花瓶', en: 'Ceramic Vase', front: false },
    { key: 'flower_vase', zh: '插花花瓶', en: 'Flower Vase', front: false },
    { key: 'succulent_pot', zh: '多肉盆栽', en: 'Potted Succulent', front: false },
    { key: 'table_clock', zh: '桌面时钟', en: 'Table Clock', front: true },
    { key: 'landscape_frame', zh: '风景相框', en: 'Landscape Photo Frame', front: true },
    { key: 'reed_diffuser', zh: '香薰瓶', en: 'Reed Diffuser', front: false },
    { key: 'storage_box', zh: '收纳盒', en: 'Storage Box', front: true },
    { key: 'ring_sculpture', zh: '小型环形雕塑', en: 'Ring Sculpture', front: true }
];
export const networkElectronics = [
    { key: 'desktop_projector', zh: '桌面投影仪', en: 'Desktop Projector', model: 'network', style: 'projector', pose: 'fixed' },
    { key: 'conference_phone', zh: '会议电话', en: 'Conference Phone', model: 'network', style: 'phone', pose: 'fixed' },
    { key: 'network_switch', zh: '8口交换机', en: 'Eight-Port Switch', model: 'network', style: 'switch', pose: 'fixed' },
    { key: 'four_bay_nas', zh: '四盘位NAS', en: 'Four-Bay NAS', model: 'network', style: 'nas', pose: 'fixed' },
    { key: 'tower_ups', zh: '塔式UPS', en: 'Tower UPS', model: 'network', style: 'ups', pose: 'fixed' },
    { key: 'compact_shredder', zh: '小型碎纸机', en: 'Compact Shredder', model: 'network', style: 'shredder', pose: 'fixed' }
];
export const lifestyleItems = [...officeStationery, ...homeDecor];
export const newProps = [...lifestyleItems, ...networkElectronics];
export const cityAdvertisements = [
    { key: 'ad_city_computer', series: 'city', zh: '创作工作站', en: 'CREATE YOUR WORLD', aspect: 'wide' },
    { key: 'ad_city_gaming', series: 'city', zh: '下一关见', en: 'NEXT LEVEL', aspect: 'wide' },
    { key: 'ad_city_camera', series: 'city', zh: '定格此刻', en: 'CAPTURE THE MOMENT', aspect: 'portrait' },
    { key: 'ad_city_music', series: 'city', zh: '城市声场', en: 'CITY SOUND', aspect: 'portrait' },
    { key: 'ad_city_bookshop', series: 'city', zh: '翻开新世界', en: 'OPEN A NEW WORLD', aspect: 'portrait' },
    { key: 'ad_city_florist', series: 'city', zh: '花开日常', en: 'EVERYDAY BLOOMS', aspect: 'square' },
    { key: 'ad_city_travel', series: 'city', zh: '出发吧', en: 'GO EXPLORE', aspect: 'wide' },
    { key: 'ad_city_home', series: 'city', zh: '理想居所', en: 'MAKE ROOM FOR LIFE', aspect: 'square' }
];
