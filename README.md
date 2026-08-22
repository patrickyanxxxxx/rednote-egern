# RedNote Egern 去广告模块

[中文](#中文说明) | [English](#english)

## 中文说明

适用于 Egern 的 RedNote（小红书国际版）去广告与界面净化模块。模块依据 RedNote 9.44 网络元数据，并结合多个公开小红书去广告项目的接口与源码进行适配。

### 远程模块地址

```text
https://raw.githubusercontent.com/patrickyanxxxxx/rednote-egern/main/RedNote_Remove_Ads.yaml
```

### 安装方法

1. 在 Egern 中添加远程模块。
2. 粘贴上面的模块地址并启用。
3. 开启 Egern MITM。
4. 安装并信任 Egern CA 证书。
5. 更新模块后，彻底关闭 RedNote 再重新打开。

### 主要功能

- 过滤首页和详情视频流中的原生广告、赞助内容及推广卡片
- 过滤直播卡片、商品关联内容和非笔记推荐项目
- 清理搜索横幅、热搜、搜索提示、趋势词和搜索推广
- 移除开屏广告、营销弹窗、界面推广和详情页小部件
- 清理详情页相关搜索、猜你想搜等组件
- 清理笔记和视频中的原生音乐入口及音乐元数据
- 开启图片、视频保存权限并调整水印开关
- 拦截独立广告媒体域名和广告上报接口
- 拦截 `xhslink.com/o/...` 类型的帖子分享短链
- 同时兼容 RedNote `rnote.com` 和小红书 `xiaohongshu.com` 接口

### 脚本结构

- `RedNote_Remove_Ads.yaml`：Egern 远程模块、规则和 URL 路由
- `scripts/feed_ads.js`：首页信息流广告、直播、推荐用户、相关搜索和音乐清理
- `scripts/search.js`：搜索横幅、热搜、提示词、趋势词和推广结果清理
- `scripts/system.js`：开屏广告、系统配置、界面推广和详情页组件清理
- `scripts/note.js`：详情视频流、笔记、评论、相关搜索、音乐及保存权限处理

每类响应 URL 只交给一个功能脚本处理，避免多个脚本重复读取同一响应体。

### 注意事项

- HTTPS 响应修改依赖 MITM；未安装或未信任证书时，脚本不会生效。
- RedNote 的接口和字段可能随地区、账号或 App 版本变化。
- 抓包文件只包含加密 TLS 元数据，不包含解密后的响应 JSON；国际版适配依据已确认域名、公开源码和回归测试完成。
- 更新远程模块后，如 Egern 仍使用旧脚本，请手动刷新模块，或删除后使用同一地址重新添加。

### 参考来源、原作者与致谢

本项目不是从零发现所有小红书接口。Egern 版本的接口匹配和处理行为参考了以下公开项目与原作者：

- **RuCu6**（[@RuCu6](https://github.com/RuCu6)）：`RuCu6/Loon` 中的小红书脚本原作者之一。参考了 `v3/v4 note/videofeed`、`v6/homefeed`、用户推荐、图片/视频保存、水印和评论实况照片等处理逻辑。
- **fmz200**（[@fmz200](https://github.com/fmz200)）：`fmz200/wool_scripts` 中 `Scripts/xiaohongshu/xiaohongshu.js` 的署名作者。参考了广告字段判定、搜索净化、信息流过滤、下载权限、视频流选择和评论区处理逻辑。
- **奶思**：`fmz200/wool_scripts` 中小红书 Loon 插件的署名作者/封装维护者，提供了 Loon、Surge、Quantumult X 和 Shadowrocket 的规则入口与接口匹配配置。
- **Moli-X**（[Moli-X/Resources](https://github.com/Moli-X/Resources)）：提供另一套公开小红书去广告实现。参考了 `is_ads` 首页过滤、开屏配置、系统配置和广告上报接口。
- **QingRex**（[QingRex/LoonKissSurge](https://github.com/QingRex/LoonKissSurge)）：维护和分发署名为 RuCu6、fmz200 的 Surge 模块；参考了模块的接口分类、MITM 主机和 Map Local 配置。
- **Kelee / iKeLee**（[hub.kelee.one](https://hub.kelee.one)）：提供相关插件的整理、分发和模块配置，参考了其公开的小红书插件接口范围。

感谢以上原作者和维护者公开规则与源码。本仓库没有把上游脚本原样复制为 Egern 文件，而是依据其公开逻辑，使用 Egern 原生 `ctx` API 重新实现，并增加 RedNote 国际版 `rnote.com` 域名适配、功能拆分和回归测试。原始逻辑与接口发现的贡献归属于上述原作者和项目。

---

## English

An Egern module for removing ads and cleaning interface elements in RedNote, the international version of Xiaohongshu. The module was adapted from RedNote 9.44 network metadata and reviewed behavior from several public Xiaohongshu ad-blocking projects.

### Remote Module URL

```text
https://raw.githubusercontent.com/patrickyanxxxxx/rednote-egern/main/RedNote_Remove_Ads.yaml
```

### Installation

1. Add a remote module in Egern.
2. Paste the module URL above and enable it.
3. Enable MITM in Egern.
4. Install and trust the Egern CA certificate.
5. After updating the module, fully close and reopen RedNote.

### Features

- Filters native ads, sponsored content, and promotional cards from home and detail video feeds
- Removes live-stream cards, product-linked content, and non-note recommendations
- Clears search banners, hot lists, hints, trending terms, and promoted results
- Removes splash ads, marketing popups, UI promotions, and detail-page widgets
- Removes related-search and recommendation widgets from detail pages
- Removes native-music entries and music metadata from notes and videos
- Enables image and video saving and adjusts watermark restrictions
- Blocks dedicated ad-media domains and advertising report endpoints
- Blocks post share links matching `xhslink.com/o/...`
- Supports both RedNote `rnote.com` and compatible Xiaohongshu `xiaohongshu.com` endpoints

### Script Layout

- `RedNote_Remove_Ads.yaml`: Egern remote module, rules, and URL routing
- `scripts/feed_ads.js`: home-feed ads, live streams, recommended users, related searches, and music cleanup
- `scripts/search.js`: search banners, hot lists, hints, trending terms, and promoted-result cleanup
- `scripts/system.js`: splash ads, system configuration, UI promotions, and detail-widget cleanup
- `scripts/note.js`: detail video feeds, notes, comments, related searches, music, and save permissions

Each response URL is routed to one functional script only, preventing multiple scripts from consuming the same response body.

### Notes

- HTTPS response modification requires MITM. Scripts will not work unless the Egern CA certificate is installed and trusted.
- RedNote endpoints and response fields may vary by region, account, and app version.
- The packet capture contains encrypted TLS metadata rather than decrypted response JSON. International adaptation is based on confirmed domains, reviewed public source code, and regression tests.
- If Egern keeps using cached scripts after an update, manually refresh the module or remove and re-add it using the same URL.

### Source Authors, Attribution, and Credits

This project did not independently discover every Xiaohongshu endpoint. The Egern implementation reviewed the following public projects and source authors:

- **RuCu6** ([@RuCu6](https://github.com/RuCu6)): one of the original authors of the Xiaohongshu scripts in `RuCu6/Loon`. The implementation reviewed includes `v3/v4 note/videofeed`, `v6/homefeed`, user recommendations, image/video saving, watermark handling, and comment live-photo processing.
- **fmz200** ([@fmz200](https://github.com/fmz200)): the credited author of `Scripts/xiaohongshu/xiaohongshu.js` in `fmz200/wool_scripts`. The implementation reviewed includes ad-field detection, search cleanup, feed filtering, download permissions, video-feed handling, and comment processing.
- **Naisi (奶思)**: credited author and packaging maintainer of the Xiaohongshu Loon plugin in `fmz200/wool_scripts`, including the Loon, Surge, Quantumult X, and Shadowrocket rule entry points.
- **Moli-X** ([Moli-X/Resources](https://github.com/Moli-X/Resources)): provider of an independent public Xiaohongshu ad-blocking implementation. The implementation reviewed includes `is_ads` home-feed filtering, splash configuration, system configuration cleanup, and ad-report endpoints.
- **QingRex** ([QingRex/LoonKissSurge](https://github.com/QingRex/LoonKissSurge)): maintainer and distributor of the Surge module credited to RuCu6 and fmz200. The module classification, MITM hosts, and Map Local rules were reviewed.
- **Kelee / iKeLee** ([hub.kelee.one](https://hub.kelee.one)): provider of public plugin organization, distribution, and module configuration. Its published Xiaohongshu plugin endpoint coverage was reviewed.

Thanks to the original authors and maintainers for publishing their rules and source code. This repository does not copy the upstream scripts verbatim. It reimplements the reviewed behavior with Egern's native `ctx` API, adds RedNote international `rnote.com` compatibility, separates the processing by function, and includes regression tests. Credit for the original logic and endpoint discovery belongs to the authors and projects listed above.
