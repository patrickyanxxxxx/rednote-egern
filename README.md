# RedNote Egern 去广告模块

**最新发行版：v2026.09.18**

当前推荐组合：`RedNote_Remove_Ads_Lite.yaml` + 图片 CDN 直连规则。Lite 版保留去广告、视频快路径、组件净化、去水印和 IP 属地，只对图片 `imagefeed` 做定向保存权限处理，并避免对评论与私信响应做重型改写。

[中文](#中文说明) | [English](#english)

## 中文说明

适用于 Egern 的 RedNote（小红书国际版）去广告与界面净化模块。模块依据 RedNote 9.44 网络元数据，并结合多个公开小红书去广告项目的接口与源码进行适配。

### 远程模块地址

**推荐：Lite 最新版**

```text
https://raw.githubusercontent.com/patrickyanxxxxx/rednote-egern/main/RedNote_Remove_Ads_Lite.yaml
```

兼容旧版完整版：

```text
https://raw.githubusercontent.com/patrickyanxxxxx/rednote-egern/main/RedNote_Remove_Ads.yaml
```

当前发行版：`v2026.09.18`

### 安装方法

1. 在 Egern 中添加远程模块。
2. 粘贴上面的模块地址并启用。
3. 开启 Egern MITM。
4. 安装并信任 Egern CA 证书。
5. 更新模块后，彻底关闭 RedNote 再重新打开。

### 推荐分流配合

图片/头像 CDN 直连规则：

```text
https://raw.githubusercontent.com/patrickyanxxxxx/xiaohongshu-rednote-egern-rules/main/REDnote-Image-DIRECT.yaml
```

将它放在 `REDnote-Global.yaml` 之前；视频 CDN `sns-v27.rednotecdn.com` 不在图片直连规则中，继续使用原视频策略。

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

### 当前 Lite 版脚本结构

- `RedNote_Remove_Ads_Lite.yaml`：推荐的轻量模块
- `scripts/feed_ads_lite_v2.js`：首页和关注流广告净化，恢复保存菜单并保留帖子 IP 属地
- `scripts/videofeed_ads_fast_v2.js`：视频流顶层快路径，恢复下载入口、去水印和广告过滤
- `scripts/note_display_lite_v2.js`：笔记详情与图片 `imagefeed` 保存/去水印处理
- `scripts/widgets_lite_v2.js`：相关搜索、热点、活动、地点、音乐、合集和粉丝群组件净化
- `scripts/search_ads_lite.js`：搜索广告组件净化

Lite 版绕过评论和私信的重型响应改写，只对图片 `imagefeed` 做定向保存/去水印处理，避免刷一段时间后内容和评论请求失效。视频流仍只处理每条视频的顶层字段，并补回下载入口。

### 注意事项与免责声明

- 本插件及其 Egern 脚本主要由 AI 根据抓包元数据、公开规则和公开源码辅助分析并撰写，未经 RedNote 官方验证。
- 不保证稳定性、准确性、兼容性或能够完全去除所有广告；可能出现漏拦截、误拦截、功能异常或随 App 更新失效。
- 使用者应自行评估风险；因使用本插件产生的账号、网络、数据或 App 功能问题，作者与参考项目维护者不承担责任。
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

**Latest release: `v2026.09.18`**

The recommended release is the Lite module. It keeps ad cleanup, the shallow video-feed fast path, widget cleanup, watermark controls, and post IP-location fields. Image `imagefeed` responses receive targeted save/watermark handling, while heavy comment and private-message rewriting remains disabled.

### Remote Module URL

Recommended Lite module:

```text
https://raw.githubusercontent.com/patrickyanxxxxx/rednote-egern/main/RedNote_Remove_Ads_Lite.yaml
```

Legacy complete module:

```text
https://raw.githubusercontent.com/patrickyanxxxxx/rednote-egern/main/RedNote_Remove_Ads.yaml
```

Image/avatar CDN direct-route companion:

```text
https://raw.githubusercontent.com/patrickyanxxxxx/xiaohongshu-rednote-egern-rules/main/REDnote-Image-DIRECT.yaml
```

### Installation

1. Add a remote module in Egern.
2. Paste the module URL above and enable it.
3. Enable MITM in Egern.
4. Install and trust the Egern CA certificate.
5. After updating the module, fully close and reopen RedNote.
6. If using the image direct-route companion, place it before the broad `REDnote-Global.yaml` rule set. Keep `sns-v27.rednotecdn.com` on the existing video policy.

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

### Lite Script Layout

- `RedNote_Remove_Ads_Lite.yaml`: recommended Lite module
- `scripts/feed_ads_lite_v2.js`: home/follow-feed ad cleanup with restored save-menu entries and preserved post IP locations
- `scripts/videofeed_ads_fast_v2.js`: shallow video-feed fast path with restored download entries, ad filtering, and watermark handling
- `scripts/note_display_lite_v2.js`: note-detail and image `imagefeed` save/watermark handling
- `scripts/widgets_lite_v2.js`: related search, hotspots, activities, locations, music, collections, and fan-group cleanup
- `scripts/search_ads_lite.js`: search-component cleanup

The Lite release avoids heavy comment and private-message response rewriting. It adds only targeted image `imagefeed` save/watermark handling and avoids recursive traversal of large video metadata objects.

### Notes and Disclaimer

- This plugin and its Egern scripts were primarily written with AI assistance, based on packet metadata, public rules, and publicly available source code. They have not been verified by RedNote's official developers.
- No guarantee is made regarding stability, accuracy, compatibility, or complete ad removal. The plugin may miss ads, remove legitimate content, break features, or stop working after an app update.
- Users should evaluate the risks themselves. The author and the maintainers of the referenced projects are not responsible for account, network, data, or app-function issues caused by using this plugin.
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
