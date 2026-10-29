const prop = (key, zh, en, group, height = 1, wallOnly = false) => ({ key, zh, en, group, height, wallOnly, placementFront: 0 });
export const patch074Props = [
    prop('electrical_distribution_cabinet', '低压配电柜', 'Low Voltage Distribution Cabinet', 'electrical_equipment', 2),
    prop('dry_type_transformer', '干式变压器', 'Dry Type Transformer', 'electrical_equipment', 2),
    prop('standby_generator', '备用发电机', 'Standby Generator', 'electrical_equipment', 2),
    prop('cable_reel', '电缆卷盘', 'Cable Reel', 'electrical_equipment'),
    prop('electrician_toolbox', '电工工具箱', 'Electrician Toolbox', 'electrical_equipment'),
    prop('wall_electric_meter', '壁挂电表箱', 'Wall Electric Meter Box', 'electrical_equipment', 1, true),
    prop('insulator_display', '绝缘子陈列组', 'Insulator Display', 'electrical_equipment'),
    prop('field_news_camera', '外景摄像机与三脚架', 'Field News Camera and Tripod', 'news_equipment', 2),
    prop('studio_news_camera', '演播室摄像机', 'Studio News Camera', 'news_equipment', 2),
    prop('news_microphone_stand', '新闻话筒台', 'News Microphone Stand', 'news_equipment', 2),
    prop('interview_audio_set', '采访话筒与录音机套装', 'Interview Microphone and Recorder Set', 'news_equipment'),
    prop('news_teleprompter', '提词器', 'News Teleprompter', 'news_equipment', 2),
    prop('broadcast_control_desk', '导播控制台', 'Broadcast Control Desk', 'news_equipment'),
    prop('news_backdrop', '新闻背景板', 'News Backdrop', 'news_equipment', 2),
    prop('riot_shield_display', '防暴盾牌展示架', 'Riot Shield Display', 'military_police_equipment', 2),
    prop('road_safety_barrier', '道路隔离路障', 'Road Safety Barrier', 'military_police_equipment'),
    prop('military_police_cabinet', '军警装备柜', 'Military Police Equipment Cabinet', 'military_police_equipment', 2),
    prop('helmet_display', '头盔展示座', 'Helmet Display', 'military_police_equipment'),
    prop('communications_radio', '通信电台', 'Communications Radio', 'military_police_equipment'),
    prop('radar_equipment', '雷达设备', 'Radar Equipment', 'military_police_equipment', 2),
    prop('tactical_equipment_case', '战术装备箱', 'Tactical Equipment Case', 'military_police_equipment')
];
export const patch074ById = new Map(patch074Props.map(d => ['mcpe_food:' + d.key, d]));
export const patch074Groups = [
    { key: 'electrical_equipment', zh: '电气设备', en: 'Electrical Equipment' },
    { key: 'news_equipment', zh: '新闻设备', en: 'News Equipment' },
    { key: 'military_police_equipment', zh: '军警物品', en: 'Military and Police Displays' }
].map(g => ({ ...g, items: patch074Props.filter(d => d.group === g.key) }));
export const patch074WallVariants = patch074Props.filter(d => d.wallOnly).map(d => ({ key: d.key + '_wall', base: d.key, zh: '壁挂 ' + d.zh, en: 'Wall ' + d.en }));
export const patch074Screens = new Set(['news_teleprompter', 'broadcast_control_desk', 'communications_radio', 'radar_equipment']);
export const patch074DigitalScreens = [
    { key: 'digital_ft_computer_6x5', zh: '电子广告屏 · FT电脑 6×5', en: 'Digital Ad Screen · FT Computer 6x5', brand: 'ft_computer', width: 6, height: 5 },
    { key: 'digital_apple_6x5', zh: '电子广告屏 · Apple 6×5', en: 'Digital Ad Screen · Apple 6x5', brand: 'apple', width: 6, height: 5 }
];
