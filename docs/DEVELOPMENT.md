# 0.4.3维护说明

## 内容与兼容接口

src/catalog.ts继续维护101种可食成品、8种展示配菜及旧配方。VesselFamily增加wine_glass，compatibleVessels对10款饮品显式允许glass和mug，premium_red_wine另允许wine_glass。原Food.vessel不改变，旧<food>_serving继续有效；新增替代组合仍使用<food>_on_<vessel>。

src/decor-catalog.ts维护12幅广告画及系列、两款纸杯、托盘、70种可托盘盛装的内容和339种桌面展示定义。餐具总数为9个可盛装器皿、4种刀叉筷勺和1个托盘，共14。纸杯是独立摆件，未加入Vessel或Food。

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

普通桌面模型与食物保留128px；旧原料、作物和厨具为64px。海报为1024或2048px，PNG读取器支持RGB／RGBA及五种行过滤。所有MER与色图同尺寸，G通道为零。纸杯纸面哑光、盖子半光泽；打印标识为独立UV区域。

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

包版本来自package.json，并同步package-lock。BP/RP的UUID保持不变。capture-compat.mjs在变更前捕获旧包基线，禁止覆盖已有文件；本次新增v0.4.2基线。

package生成两个mcpack、嵌套mcaddon及source.zip，源码归档仅收录代码、测试、文档和美术源，不收录node_modules和整个工作目录。Python独立核对嵌套包、私有实体PBR、CRC及SHA-256。

自动测试采用稳定API替身，离线渲染不模拟官方PBR，也不能证明游戏客户端、触屏与真实联机行为。
