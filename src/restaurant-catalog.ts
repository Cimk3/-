export const serviceElectronics = [
 {key:'touchscreen_register',zh:'触屏收银机',en:'Touchscreen Cash Register',model:'register',style:'register',pose:'fixed'},
 {key:'payment_scanner',zh:'扫码支付终端',en:'Payment Scanner Display',model:'scanner',style:'scanner',pose:'fixed'},
 {key:'receipt_printer',zh:'热敏小票机',en:'Thermal Receipt Printer',model:'receipt',style:'receipt',pose:'fixed'}
] as const;
export const restaurantAccessories = [
 {key:'table_number_sign',zh:'可调桌号牌',en:'Adjustable Table Number Sign'},
 {key:'menu_stand',zh:'菜单立牌',en:'Menu Stand'},
 {key:'reserved_sign',zh:'预约牌',en:'Reserved Sign'},
 {key:'service_bell',zh:'服务铃',en:'Service Bell'},
 {key:'tissue_box',zh:'纸巾盒',en:'Tissue Box'}
];
export const restaurantItems=[...serviceElectronics,...restaurantAccessories];
export const numberKey=(n:number)=>n===8?'table_number_sign':`table_number_sign_${String(n).padStart(2,'0')}`;
export const numberVisuals=Array.from({length:99},(_,i)=>({key:numberKey(i+1),zh:`桌号 ${String(i+1).padStart(2,'0')}`,en:`Table ${String(i+1).padStart(2,'0')}`,number:i+1}));
export function validTableNumber(n:unknown):n is number{return typeof n==='number'&&Number.isInteger(n)&&n>=1&&n<=99;}
