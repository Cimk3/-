# 0.5.3维护说明

## 内容与兼容接口

src/catalog.ts继续维护102种可食成品、8种展示配菜及旧配方。VesselFamily增加wine_glass，compatibleVessels对11款饮品显式允许glass和mug，premium_red_wine另允许wine_glass。原Food.vessel不改变，旧<food>_serving继续有效；新增替代组合仍使用<food>_on_<vessel>。

src/decor-catalog.ts维护12幅广告画及系列、两款纸杯、托盘、70种可托盘盛装的内容和361种桌面展示定义（原354种索引不变，追加7种外观）。餐具总数为9个可盛装器皿、4种刀叉筷勺、1个托盘和1套茶盘，共15。纸杯是独立摆件，未加入Vessel或Food。

surfaceVisuals的索引只用于即时客户端渲染；持久记录保存字符串ID，升级后按ID重新建立索引。实体不作为食物内容的唯一来源。

## 持久交互

src/decor-runtime.ts使用带version、uid、revision、dimension、support、direction、definition和slots的DecorRecord。广告画另存art及size；native标识托盘是否由原生方块承载。world动态属性按实例保存，序号独立递增。

菜单复用原MenuSessions：确认时重新检查目标实例、revision、距离、背包、当前手持物和支撑。同步修改背包与持久记录，失败还原；不跨await持有写锁。破坏操作读取最新记录，避免丢失另一玩家刚装入的菜。

surface_display承载低位器皿和摆件；tray_food_display分别承载三槽的小份料理；advert_display承载广告画。所有实体关闭重力、物理碰撞、推动和原生伤害。实体只保存owner/part等显示关联，实际内容在记录中。

加载后恢复记录并修复缺失／重复展示，实体加载时也进行核对。每20tick分批核对最多24条记录，跳过未加载支撑。只有位置、索引、尺寸或选择范围变化时才更新实体，避免持续发送相同数据。

原生桌面方块定时检查下方支撑；变为下半砖时将原ID、方向和内容迁移成贴面实体，不修改半砖本身。书架顶面的本包放置及低位实体交互在before事件取消原生使用，再进入可写阶段。

## 生成与材质

tools/build.mjs仍加载build-v3.mjs；build-displays.mjs输出私有实体几何、客户端定义、行为定义、渲染控制器和PBR。

实体多材质通过food／ware分骨骼和两个控制器绘制，食物与器皿使用各自纹理。新增文件仅在mcpe_food私有目录与标识下；禁止全局材质、光照、原版画与原版实体控制器覆盖。

decor-art.mjs负责托盘、纸杯和小份料理。小份模型按占据体素合并，选择满足48方块体预算的最高细分，保留材质角色，再缩放到小盘尺寸。托盘本体65方块体，使用上限48的三份料理时总预算209。

普通桌面模型与食物保留128px；旧原料、作物和厨具为64px。海报为1024或2048px，PNG读取器支持RGB／RGBA及五种行过滤。所有MER与色图同尺寸；旧内容G通道为零，仅电子设备白名单屏幕和LED区域允许低强度自发光。纸杯纸面哑光、盖子半光泽；打印标识为独立UV区域。

## 海报源文件

assets/posters/originals保存12张内置image_gen主图；generation.json保存提示词与生成来源；layout.json保存可编辑的文字、比例和主题定义。tools/poster-layout.py用Pillow和中文字体排版，输出masters及广告画总览。

普通npm构建只读取masters，不调用外部服务。要改变文字或版式，修改layout与排版脚本后重新输出；重新生成主图使用内置image_gen，不自动切换到付费API路径。

## 构建与发行

```powershell
npm ci
npm run check
npm test
npm run package
python tools/verify_archive.py
```

包版本来自package.json，并同步package-lock。BP/RP的UUID保持不变。capture-compat.mjs在变更前捕获旧包基线，禁止覆盖已有文件；本次新增v0.5.1基线。

package生成两个mcpack、嵌套mcaddon及source.zip，源码归档仅收录代码、测试、文档和美术源，不收录node_modules和整个工作目录。Python独立核对嵌套包、私有实体PBR、CRC及SHA-256。

自动测试采用稳定API替身，离线渲染不模拟官方PBR，也不能证明游戏客户端、触屏与真实联机行为。

## 电子设备

src/electronics-catalog.ts是26款桌面设备的稳定ID、双语名称、模型种类、款式与固定姿态目录；不属于Food或Vessel。tableItems追加设备以接入摆放入口，surfaceVisuals将设备追加在所有旧展示定义之后。持久记录仍为version=1、kind=surface，保存实际设备ID，不记录可切换状态。

电子设备在全部受支持顶面使用受脚本检查的展示实体，不替换支撑或空气方块。生成的同ID隐藏方块保留用于原生命令与低位迁移；物品放置在before事件取消后延迟到可写阶段，复核手持、支撑、占位、距离及背包并同步提交。

build-v3.mjs从实际模型生成选择框；build-displays.mjs为各设备生成对应高度的选择形状事件。闭合本与键鼠为低矮形状，显示器和机柜使用各自高度。没有新增实体类型、全局材质、系统菜单、网络功能或运行时开合动画。

emission-policy.mjs仅放行目录中设备的私有device_纹理名，校验屏幕／LED区域和G值上限24，并拒绝闭合本或其他资源发光；原有食物等资源继续严格无自发光。资产、运行时及旧版兼容测试分别验证生产文件、交互守恒和0.4.3基线。

## 0.5.1接口与结构

设备screenFront定义模型正面基准，openAngle仅用于静态造型说明；screenYaw根据玩家相对锚点的位置计算并吸附四向的新放置角度。DecorRecord追加可选yaw，旧记录按direction恢复；模型、广告、无屏设备不使用全局旋转修正。旋转只在创建时计算，并在位置／角度变化时更新展示实体。原354项surfaceVisuals顺序保留，新增7项外观追加。

generate-surfaces.mjs依据固定vanilla-data 1.26.52清单和审定形状族生成vanilla-surfaces.ts；每个登记ID必须明确属于完整表面、半砖或排除项，未知ID使生成失败。保持稳定API 2.0.0，不使用isSolid预发行属性。原来已支持的泥巴保留兼容判定，并在分类中注明例外。

冰箱目录独立于可盛装器皿；6个库存物品对应9个私有部件方块，统一放入电子设备组。DecorRecord增加kind=appliance，按定义推导竖向部件位置；记录先发布再写部件，写方块或背包失败时还原。部件原生掉落表为空，所有正常拆除由拥有者记录统一返还一次。拆除同时清理以部件为支撑的摆件和广告画，继承创造／生存掉落模式。

冰箱部件关闭活塞移动；辅助块不提供库存物品。区块未加载时跳过检查，命令放置的底座由tick建立实例，孤立上部只清除、不生成物品。茶盘是单件surface摆件，铁观音沿用双杯盛装逻辑，没有新增配方或茶盘取茶交互。

## 0.5.2几何与四向迁移

屏幕、边框、背板及iPad支撑的绕X轴倾斜经device-geometry.mjs转成1/8模型单位的水平条带；每条带以实际坐标定义，不输出原生X旋转。UV按屏幕原行分配，条带竖向不重叠；边框宽度略小于基座，避免铰链侧面共面。其他设备、餐具的旋转规则不变。

emittedLidAngle从实际屏幕条带中段的中心坐标测量110°，回归测试另外读取最终方块与实体几何，核查顶缘向键盘后方退让。不能用源rotation参数代替发行几何检查，也不能将软件预览当作真实客户端证据。

cardinalYaw只输出0、90、-90、-180。放置仍使用玩家位置确定屏幕正面；斜角位置选择最近四向。loadDecorRecords对已存电子设备数值yaw一次性吸附并递增revision，不改动位置、内容和UID；已经四向的记录不重复修改，没有yaw的旧记录保留direction。

## 0.5.3接口与兼容

设备placementFront单独定义放置正面；screenFront仅说明屏幕存在及方向，不再作为无屏设备的放置开关。router/server/printer同样计算持久yaw；旧路由器与服务器缺少yaw时继续按direction恢复。没有新增存档字段或持续追踪。

officeElectronics单独保存7项新目录，surfaceVisuals在原361项之后追加，索引总数368，不能直接把设备插进旧列表中间。tasting_new仅发放本版7项；electronics发放32项（含6款冰箱）。

新增tests/fixtures/v0.5.2.json与v0.5.2-surfaces.json作为发行前兼容基线。模型回归读取最终方块和实体JSON，检查屏幕完整UV、遮挡和深度间隔，而不仅比较源旋转或共面。倾斜支架按自身网格处理，只有屏幕、外壳等110°同组部件共用Y网格。

发行目标为https://github.com/Cimk3/A-Bite-of-Time.git；每版提交、打v版本标签并创建GitHub Release，附mcaddon、两个mcpack、源码ZIP与SHA256SUMS.txt。
