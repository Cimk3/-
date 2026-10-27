# 0.5.2独立广告画目录

12幅广告画，均有小／中／大三档。每幅一个物品，不替换原版随机画。

| 系列 | 中文标题 | 英文副标题 | 物品ID | 比例 | 小／中／大 |
|---|---|---|---|---|---|
| 日式小吃 | 日式小食 | Japanese Snacks | `mcpe_food:ad_japanese_snacks` | 2:1 | 2×1 / 4×2 / 6×3 |
| 日式小吃 | 日式夜食 | Japanese Night Bites | `mcpe_food:ad_japanese_night` | 1:2 | 1×2 / 2×4 / 3×6 |
| 西餐 | 惠灵顿牛排 | Beef Wellington | `mcpe_food:ad_wellington` | 2:1 | 2×1 / 4×2 / 6×3 |
| 西餐 | 香草烤羊排 | Herb Roasted Lamb | `mcpe_food:ad_lamb` | 1:1 | 1×1 / 2×2 / 3×3 |
| 西餐 | 奶油焗龙虾 | Lobster Thermidor | `mcpe_food:ad_lobster` | 1:2 | 1×2 / 2×4 / 3×6 |
| 粤菜 | 广府烧味 | Cantonese Roast | `mcpe_food:ad_cantonese_roast` | 2:1 | 2×1 / 4×2 / 6×3 |
| 粤菜 | 早茶时光 | Cantonese Morning Tea | `mcpe_food:ad_dim_sum` | 1:2 | 1×2 / 2×4 / 3×6 |
| 火锅 | 铜锅涮肉 | Copper Hotpot | `mcpe_food:ad_hotpot` | 2:1 | 2×1 / 4×2 / 6×3 |
| 中餐 | 中式盛宴 | Chinese Banquet | `mcpe_food:ad_banquet` | 2:1 | 2×1 / 4×2 / 6×3 |
| 中餐 | 清蒸鲜味 | Steamed Grouper | `mcpe_food:ad_grouper` | 2:1 | 2×1 / 4×2 / 6×3 |
| 中餐 | 家常好味 | Chinese Bistro | `mcpe_food:ad_home_cooking` | 1:1 | 1×1 / 2×2 / 3×3 |
| 甜品店 | 甜品时光 | Patisserie Moments | `mcpe_food:ad_dessert` | 1:2 | 1×2 / 2×4 / 3×6 |

## 放置与收回

持画点击完整墙面侧面，菜单选择尺寸；点击方块为画面左下角，向右、向上延伸。需要足够背墙和前方空间，与本包其他广告画不能重叠。

空手点击对应画面区域打开尺寸／收回菜单。背包满不能收回，放大受阻不改变现有画。拆画时墙保留；其他背墙失去支撑会移除广告画。

## 源文件与预览

- originals：12张内置image_gen生成的原始主图。
- masters：附中文标题、英文副标题及边框的游戏主贴图。
- layout.json：排版文字和比例。
- generation.json：生成提示词、主题和原图项目路径。
- tools/poster-layout.py：独立中文排版脚本。

主图没有价格、真实餐厅商标或水印。各尺寸复用同一构图，普通模式与灵动视效均读取同一色图。MER为哑光非金属，无自发光。

[海报总览](../previews/advertisements.png) / [实际UV墙面预览](../previews/poster_wall.png)。两者都是离线图片，不代表实际游戏画面。
