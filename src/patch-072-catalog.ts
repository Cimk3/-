/** Append-only 0.7.2 batch. Clothing IDs are inventory content, never armor. */
const prop=(key:string,zh:string,en:string,group:string,height=1,wallOnly=false)=>({key,zh,en,group,height,wallOnly,placementFront:0});
export const patch072Props=[
 prop('single_clothing_rail','单杆挂衣架','Single Clothing Rail','clothing_fixtures',2),
 prop('double_clothing_shelf','双层展示架','Double Clothing Shelf','clothing_fixtures',2),
 prop('mannequin_display','人台展示架','Mannequin Display','clothing_fixtures',2),
 prop('full_length_mirror','全身镜','Full Length Mirror','clothing_fixtures',2),
 prop('transit_ticket_gate','检票闸机','Transit Ticket Gate','transit_equipment'),
 prop('platform_information_screen','站台信息屏','Platform Information Screen','transit_equipment',1,true),
 prop('ticket_vending_machine','自助售票机','Ticket Vending Machine','transit_equipment',2),
 prop('ft_government_desktop','FT政府限定台式机套装','FT Government Desktop Set','electronics'),
 prop('ft_government_all_in_one','FT政府限定一体机套装','FT Government All-in-One Set','electronics'),
 prop('ft_government_ultrabook_open','FT政府限定轻薄本（打开）','FT Government Ultrabook Open','electronics'),
 prop('government_queue_screen','政务叫号屏','Government Queue Screen','electronics',1,true),
 prop('upright_archive_cabinet','立式档案柜','Upright Archive Cabinet','office_stationery',2)
];
export const clothingItems=[
 {key:'display_tshirt',zh:'展示服装·T恤',en:'Display T-Shirt',style:'tshirt'},
 {key:'display_shirt',zh:'展示服装·衬衫',en:'Display Shirt',style:'shirt'},
 {key:'display_coat',zh:'展示服装·外套',en:'Display Coat',style:'coat'},
 {key:'display_trousers',zh:'展示服装·长裤',en:'Display Trousers',style:'trousers'},
 {key:'display_dress',zh:'展示服装·连衣裙',en:'Display Dress',style:'dress'},
 {key:'display_hat',zh:'展示服装·帽子',en:'Display Hat',style:'hat'},
 {key:'display_suit_black',zh:'展示正装·黑色完整西装',en:'Display Complete Black Suit',style:'suit'},
 {key:'display_suit_navy',zh:'展示正装·藏蓝完整西装',en:'Display Complete Navy Suit',style:'suit'},
 {key:'display_suit_light_gray',zh:'展示正装·浅灰完整西装',en:'Display Complete Light Gray Suit',style:'suit'}
] as const;
export const patch072ById=new Map(patch072Props.map(d=>['mcpe_food:'+d.key,d]));
export const clothingById=new Map<string,typeof clothingItems[number]>(clothingItems.map(d=>['mcpe_food:'+d.key,d]));
export const rackSpecs=[
 {key:'single_clothing_rail',capacity:2,pose:'hanging',allowHat:false},
 {key:'double_clothing_shelf',capacity:4,pose:'folded',allowHat:true},
 {key:'mannequin_display',capacity:1,pose:'mannequin',allowHat:true}
] as const;
export const rackById=new Map<string,typeof rackSpecs[number]>(rackSpecs.map(d=>['mcpe_food:'+d.key,d]));
export const clothingVisuals=(['hanging','folded','mannequin'] as const).flatMap(pose=>clothingItems.filter(d=>pose!=='hanging'||d.style!=='hat').flatMap(d=>Array.from({length:pose==='hanging'?2:pose==='folded'?4:1},(_,slot)=>({...d,pose,slot,visualKey:d.key+'_'+pose+'_'+slot}))));
export const infoScreens=patch072Props.filter(d=>d.wallOnly).map(d=>({...d,width:2,height:1,brand:d.key}));
export const patch072Screens=new Set(['transit_ticket_gate','platform_information_screen','ticket_vending_machine','ft_government_desktop','ft_government_all_in_one','ft_government_ultrabook_open','government_queue_screen']);
export const patch072Groups=[
 {key:'clothing_fixtures',zh:'服装店·展示设施',en:'Clothing Store Fixtures',items:patch072Props.filter(d=>d.group==='clothing_fixtures')},
 {key:'clothing_items',zh:'服装店·服装',en:'Clothing Store Clothing',items:clothingItems},
 {key:'transit_equipment',zh:'交通站务',en:'Transit Equipment',items:patch072Props.filter(d=>d.group==='transit_equipment')}
];
