/** Stable, static display IDs. Open/closed laptops are independent items. */
export const originalElectronics = [
  {key:'desktop_computer',zh:'台式电脑套装',en:'Desktop Computer Set',model:'desktop',style:'desktop',pose:'fixed'},
  {key:'all_in_one_computer',zh:'一体机电脑套装',en:'All-in-One Computer Set',model:'all_in_one',style:'silver',pose:'fixed'},
  {key:'silver_laptop_open',zh:'银色轻薄本（打开）',en:'Silver Ultrabook (Open)',model:'laptop',style:'silver',pose:'open'},
  {key:'silver_laptop_closed',zh:'银色轻薄本（合起）',en:'Silver Ultrabook (Closed)',model:'laptop',style:'silver',pose:'closed'},
  {key:'gaming_laptop_open',zh:'游戏本（打开）',en:'Gaming Laptop (Open)',model:'laptop',style:'gaming',pose:'open'},
  {key:'gaming_laptop_closed',zh:'游戏本（合起）',en:'Gaming Laptop (Closed)',model:'laptop',style:'gaming',pose:'closed'},
  {key:'thinkpad_open',zh:'ThinkPad（打开）',en:'ThinkPad (Open)',model:'laptop',style:'thinkpad',pose:'open'},
  {key:'thinkpad_closed',zh:'ThinkPad（合起）',en:'ThinkPad (Closed)',model:'laptop',style:'thinkpad',pose:'closed'},
  {key:'macbook_open',zh:'MacBook（打开）',en:'MacBook (Open)',model:'laptop',style:'macbook',pose:'open'},
  {key:'macbook_closed',zh:'MacBook（合起）',en:'MacBook (Closed)',model:'laptop',style:'macbook',pose:'closed'},
  {key:'router',zh:'四天线路由器',en:'Four-Antenna Router',model:'router',style:'router',pose:'fixed'},
  {key:'server_cabinet',zh:'小型服务器机柜',en:'Compact Server Cabinet',model:'server',style:'server',pose:'fixed'},
  {key:'ipad_air_magic_keyboard',zh:'iPad Air与妙控键盘',en:'iPad Air with Magic Keyboard',model:'tablet',style:'ipad',pose:'fixed'},
  {key:'crt_monitor',zh:'老式CRT显示器',en:'Retro CRT Monitor',model:'crt',style:'crt',pose:'fixed'},
  {key:'keyboard_mouse_set',zh:'键鼠套装',en:'Keyboard and Mouse Set',model:'keyboard',style:'keyboard',pose:'fixed'}
] as const;
export const newElectronics = [
  {key:'dell_laptop_open',zh:'戴尔银色轻薄本（打开）',en:'Dell Silver Ultrabook (Open)',model:'laptop',style:'dell',pose:'open'},
  {key:'dell_laptop_closed',zh:'戴尔银色轻薄本（合起）',en:'Dell Silver Ultrabook (Closed)',model:'laptop',style:'dell',pose:'closed'},
  {key:'macbook_pro_gpt_open',zh:'MacBook Pro · GPT（打开）',en:'MacBook Pro with GPT (Open)',model:'laptop',style:'macbook_pro',pose:'open'},
  {key:'macbook_pro_gpt_closed',zh:'MacBook Pro · GPT（合起）',en:'MacBook Pro with GPT (Closed)',model:'laptop',style:'macbook_pro',pose:'closed'}
] as const;
export const electronics = [...originalElectronics,...newElectronics].map(d=>({...d,
  screenFront:((d.model==='laptop'&&d.pose==='open')||['desktop','all_in_one','tablet','crt'].includes(d.model))?180:0,
  openAngle:(d.model==='laptop'&&d.pose==='open')||d.model==='tablet'?110:undefined
}));
export const electronicsById = new Map<string,typeof electronics[number]>(electronics.map(d=>[`mcpe_food:${d.key}`,d]));
