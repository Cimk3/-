# 开发与发行维护说明

## 0.7.0更新

0.7.0新增scenario-catalog及scenario-art、brand-art、digital-displays生成链；根AGENTS已纳入源码包。内容修改前保存0.6.0 fixture与完整key顺序。publish-release.py使用Credential Manager在进程内读取凭据，仅发布新版本或续传同提交草稿，核对五附件服务端SHA。

以下保留旧阶段说明，历史数量按对应版本理解。


当前软件基线0.7.0，文档核实于2026-10-28。先按[AGENTS](../AGENTS.md)阅读[PROJECT_CONTEXT](PROJECT_CONTEXT.md)、[PROGRESS](PROGRESS.md)和[KNOWN_ISSUES](KNOWN_ISSUES.md)；架构和历史原因以这些文件为入口，本页负责操作流程。

## 环境与真源

Node.js ≥22.15，TypeScript 5.9.3，固定server／server-ui 2.0.0和vanilla-data 1.26.52。普通构建只需Node及npm依赖，不运行Minecraft，也不调用图像API。Python标准库用于独立归档校验；只有重新排版旧高清海报才需Pillow和中文字体。

修改src内容目录和运行逻辑、tools美术／生成源、assets原始源；不要只修packs生成文件或预览。TS严格NodeNext编译至.build，build.mjs加载build-v3.mjs，生成BP／RP、三类展示实体、PBR、图标、预览和报告，最后运行无损优化。

生成器会删除并重建两个packs子目录，重写docs/CATALOG.md和docs/STORAGE.md，以及部分图像源产物和预览。人工上下文文档不由生成器覆盖。生成文案仍有时点常量，下次版本变更按KNOWN_ISSUES M03审查。

## 命令及副作用

从项目根目录依次执行，不并行运行会读写同一批产物的命令。

| 命令 | 用途／会修改什么 |
|---|---|
| `npm ci` | 根据lockfile安装依赖，写node_modules；网络或权限错误单独排查 |
| `npm run compile` | 生成src/vanilla-surfaces.ts并编译.build；不是完全只读检查 |
| `npm run build` | compile后重建BP／RP、美术产物、预览、部分docs和报告，并优化资源 |
| `npm test` | 先compile，再执行tests/*.test.mjs；会写编译／生成文件 |
| `node --test tests/*.test.mjs` | 使用已有匹配.build和packs运行测试；适合本次文档整理的验证，不能代替新代码编译 |
| `node tools/validate.mjs` | 核验最终生成资源，写validation-report并更新构建状态；必须等优化结束 |
| `npm run check` | 完整build后validate，成本高于只读检查 |
| `node tools/package.mjs` | 从当前资源归档、生成SHA256SUMS，并复制文档／预览到dist；不会先替你测试 |
| `npm run package` | check、test、package的完整发行流水线，会重建资源 |
| `python tools/verify_archive.py` | 独立检查归档、CRC、内外包和SHA，写archive-report.json |

常规功能修改最短完整顺序：

```powershell
npm ci
npm run build
npm test
node tools/validate.mjs
node tools/package.mjs
python tools/verify_archive.py
```

也可直接`npm run package`后运行Python归档检查。已有必要检查通过后，不因省略展示性输出反复重跑重型构建。所有结果以本次实际退出码与报告为准；仅文档任务不应运行生成器来验证文字。

## 新增内容与兼容

1. 变更前确认package版本、已编译目录与packs匹配，捕获旧发布基线。`node tools/capture-compat.mjs`用wx创建当前版本fixture，拒绝覆盖；别在包被新生成器覆盖后伪造旧基线。
2. 另外保存surfaceVisuals的完整key顺序。capture-compat不负责这份列表；0.6.0客户端几何已去重，不能从geometry别名反推99个不同桌号key。
3. 在对应目录追加定义，编写双语名称、创造分组、图标、选择范围、试用命令及私有资源引用。新增内容只面向创造模式，不新增生存链。
4. surfaceVisuals和广告均只追加；物品／方块ID、UUID、旧配方、掉落与作物状态保持兼容。不要重写旧fixture来让回归测试通过。
5. 新摆件128px、≤256方块体；托盘每份≤48；检查色图与MER尺寸、自发光区域、私有命名空间。详见[ASSETS](ASSETS.md)。
6. 编译、验证最终方块与实体模型、运行相关逻辑测试、检查实际UV预览；截图只能证明软件渲染，不能代替PBR或真实设备。
7. 更新四份上下文、CHANGELOG及受影响目录文档。固定统计／版本字符串需逐处核对，不只改package.json。

## 交互变更的检查点

- DecorRecord是真源，MenuSessions与revision处理重复／并发；确认后复核距离、支撑、手持与背包，同步提交、失败回滚，不跨await持写锁。
- surface_display负责桌面，tray_food_display负责三槽料理，advert_display负责广告。仅改变外观不能丢失实际器皿、菜品、槽位、方向、桌号或实例。
- 每20tick最多24条分批恢复；未加载状态跳过。下半砖实体贴面，原生摆件迁移保留内容。不得把区块卸载当作拆除。
- 冰箱由owner记录关联部件，整列空间检查，清理任一部件只回收一次；处理顶面依赖并禁止活塞拆分。
- 设备正面由placementFront控制，与screenFront分离。先查各款模型基准，不做全局反向；旧无yaw记录按direction保持，电子设备已有斜向yaw才吸附四向。

## 无损优化

optimize-release只作为完整构建末尾步骤。它压紧JSON、逐行优化PNG，并共享桌号几何与同用途MER；历史小型配方／掉落JSON保留字节。测量基线使用已提交fixtures，不要求新检出有.cache里的旧发行解包目录。

不要把压缩后PNG与源PNG字节不同直接判成画质改变；比较尺寸与解码RGBA。去重后检查所有实际引用和索引，统计读取最终产物。不要独立反复调用optimizeRelease刷新指标，见KNOWN_ISSUES M03。

## 图像源与重绘

旧12幅食品海报：assets/posters/originals、generation.json、layout.json及tools/poster-layout.py；普通构建读取保存的masters。新8幅城市广告：assets/posters/city中的图形源、中文栅格、layout及tools/city-posters.mjs，普通构建自动生成。

料理、器皿、冰箱、茶盘、电子、服务用品、文具家居分别在对应*-art.mjs中定义。需要重生成旧AI主图时使用用户允许的图像工具，不能自动换用收费API；普通构建不需要凭据。

## 发行与文档后续

- 版本同步package.json及package-lock；保持BP／RP UUID。所有清单版本由构建生成，不手工只改一半。
- package输出mcaddon、两个mcpack、完整源码ZIP及SHA256SUMS。游戏包仅含运行资源；源码ZIP收录src/tools/tests/assets/docs/previews及显式根文件／报告，不是整个工作区。
- **0.7.0已将根AGENTS列入源码ZIP显式清单并验证**；docs下交接文档随源码包收录。已经发布0.6.0的附件保持原状。
- 正式版本在现有main历史提交、新建v版本标签并推送至Cimk3/A-Bite-of-Time，创建Release上传五附件，核对uploaded状态和服务端SHA。不要覆盖旧标签、附件或重建旧历史。
- .cache里的临时发布脚本不是受维护的发行工具，不依赖它接续；使用安全凭据存储且不得输出Token。Git代理／权限问题按当前机器重新诊断。
- 仅文档整理不升版本、不重打包；当前0.7.0功能更新按完整发行验证。

## 真实验收

无npm启动服务器。将mcaddon导入Minecraft，同时启用相同版本BP／RP，在创造模式通过分组或`/function mcpe_food/tasting_new`试用。实际Windows、安卓、普通／灵动、保存／区块与联机检查表见VALIDATION和KNOWN_ISSUES；未运行的保留未验证。
