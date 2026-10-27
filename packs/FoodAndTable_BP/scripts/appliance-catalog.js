/** One inventory item owns one complete single/double refrigerator. */
export const refrigerators = ['single', 'double'].flatMap(shape => ['rose_gold', 'white', 'black'].map(finish => ({
    key: `fridge_${shape}_${finish}`, shape, finish, height: shape === 'double' ? 2 : 1,
    zh: `${{ rose_gold: '玫瑰金', white: '白色', black: '黑色' }[finish]}${shape === 'double' ? '双开门' : '单门'}冰箱`,
    en: `${{ rose_gold: 'Rose Gold', white: 'White', black: 'Black' }[finish]} ${shape === 'double' ? 'Double Door' : 'Compact'} Refrigerator`
})));
export const refrigeratorById = new Map(refrigerators.map(r => [`mcpe_food:${r.key}`, r]));
export const refrigeratorPartIds = refrigerators.flatMap(r => [`mcpe_food:${r.key}`, ...(r.height === 2 ? [`mcpe_food:${r.key}_upper`] : [])]);
