# RedNote Egern 模块重构与查缺补漏报告

日期：2026-10-27
输入：`shared-FCCABB6C_2026-10-27-025715.har`（1495 条请求，165MB）、`shared-9C92FFC7_2026-10-27-025715.pcap`（TLS 元数据）
范围：`RedNote_Remove_Ads_Lite.yaml` + `RedNote_Remove_Ads.yaml` 及全部脚本
远端：未推送

---

## 一、抓包有效性判定

先说结论，因为它决定后面所有结论的可信度：**抓包时 RedNote 模块未启用**。

证据：

| 检查 | 期望（模块生效时） | 实际抓包 |
|---|---|---|
| `system_service/splash_config` | 被 map_local 替换成 99 字节桩 | 93,367 字节，含完整 `ads_groups` 与广告素材 |
| `ads/resource` | 被 map_local 替换成 `{}` | 23,763 字节，返回真实广告资源列表 |

所以这是一份**原始响应基线**，适合用来查"该拦的没拦"，不能用来验证"规则有没有生效"。

另外 HAR 里 `ads-img-al`、`ads-img-bak`、`ads-video-al`、`spider-tracker` 的请求都没有 response 记录（被 REJECT），说明设备上还有别的模块在跑（HAR 里有 11 次 `rule.kelee.one`）。这部分拦截不能归功于本项目。

## 二、真实数据规模

| 项 | 数值 |
|---|---|
| 请求总数 | 1495 |
| JSON 响应样本 | 106 个接口 |
| 被任何脚本匹配的接口 | 35 个 |
| 带音频描述字段的响应 | 3 个，`audio_codec` 共 61 次 |

---

## 三、查缺补漏：真实数据暴露的问题

### 3.1 漏覆盖

| # | 接口 | 证据 | 处理 |
|---|---|---|---|
| 1 | `note/detailfeed/preload` | 9 次请求，77KB，含完整笔记与媒体描述；Lite 与完整版的正则都要求 `detailfeed` 后直接结束 | 已加入两边匹配 |
| 2 | `ads-img-bak.xhscdn.com` | 6 次请求，路径为 `magic-pocket/*.jpg` 广告位；规则里只有 `-al`/`-qc` | 已加入公共规则 |
| 3 | `im/v2/get_banner_list` | IM 页横幅广告位，`banner_info_list` | 已加入公共 map_local，保留结构只清空列表 |
| 4 | 完整版缺 `ads/resource`、`video/get_ads_info` | 两个接口都返回真实广告内容，Lite 有 map_local，完整版没有 | 已上移到公共 map_local |
| 5 | `search/trending` 层级错误 | 真实结构是 `data.data.queries`，脚本清的是 `data.queries` | 已修，见 4.3 |

### 3.2 过度覆盖（比漏覆盖更实际的问题）

匹配正则太宽，脚本在大响应上白跑：

| 接口 | 体积 | 实测耗时 | 实际改动 |
|---|---|---|---|
| `api/im/emoji/config` | 645 KB | 88.5 ms | 无 |
| `api/im/smiles/hot` | 33 KB | 4.2 ms | 无 |
| `api/sns/v3/system_service/flag_exp` | 252 KB | 59.7 ms | 无 |
| `api/sns/v6/homefeed/categories` | 12.6 KB | 2.1 ms | 无 |
| `api/sns/v1/homefeed/client_downgrade/report` | 46 B | — | 无（还是上报接口） |

根因：

- `messages.js` 的匹配是 `/(?:message|messages|chat|im|inbox|conversation|conversations)(?:/|\?|$)/`，把整个 `/api/im/*` 都吃了
- `system.js` 的匹配是 `system(?:_service)?/`，把 `flag_exp` 这种实验开关配置也吃了
- 两个 feed 脚本的模式末尾没有锚定，`homefeed/categories` 和 `homefeed/client_downgrade/report` 都被当成首页

已全部收窄为明确接口清单。

---

## 四、缺陷与修复

### 4.1 媒体描述字段被误删（VERIFIED，最严重）

`feed_ads_lite_v2.js` 的 `shouldRemoveDisplayKey` 用 `/audio/` 匹配键名，把媒体描述当音乐组件删掉。

真实 homefeed 一条响应（20 条笔记）的实测结果：

```
audio_codec ×23, audio_bitrate ×23, audio_duration ×23, audio_channels ×23  → 共 92 个字段被删
```

修复：新增 `MEDIA_FIELD` 白名单，`audio_*` / `video_*` 的编码、码率、时长、声道等字段不再参与删除。

修复后同一响应：108 个音频字段全部保留，条目数仍为 20，`has_music`、`poi_id_list` 照常清理。

### 4.2 匹配过宽（VERIFIED）

见 3.2。修复后：

- `emoji/config`、`smiles/hot`、`flag_exp`、`homefeed/categories`、`client_downgrade/report` 不再进入脚本
- 私信列表 `im/get_recent_chats`、消息页 `message/detect`、开屏 `splash_config` 仍正常覆盖

### 4.3 搜索热榜清错层级（VERIFIED）

真实响应：`data.data = {queries:[12条], hint_word:{...}, title:"猜你想搜"}`

旧代码清的是 `data.queries` / `data.hint_word`，既没清掉热榜，还往 payload 里**新增**两个空键（体积 5647 → 5675，反向增长）。

修复后：`5647 → 333` 字节，`queries` 从 12 条清空，`hint_word` 清空。

### 4.4 视频流误杀排查（未发现问题）

第一眼看到 5 条视频里有 4 条 `ad` 字段为 `null`，担心 `hasOwn(item,"ad")` 把正常笔记全杀了。实际核查：只有 1 条真正带 `ad` 键，其余 4 条根本没有该键。`5 → 4` 是正确行为，没有误杀。

### 4.5 撤回了无证据的改动

曾把 `note_display_lite_v2.js` 的递归深度从 5 提到 8，理由是 preload 响应最大深度 10。核查后发现：真实 preload 里**没有任何**需要删除的字段（`REMOVE_KEYS` 命中 0 处），深度 5 完全够用。按"无证据不加"的原则已撤回。

---

## 五、端到端效果

把整份模块（规则 + map_local + 脚本）作用在 106 个真实响应上：

| 模块 | 改动接口 | 总字节 | 削减 |
|---|---|---|---|
| Lite | 12 | 388,044 → 243,135 | **37.3%** |
| 完整版 | 10 | 226,942 → 82,995 | **63.4%** |

主要贡献项：

- `splash_config` 93KB → 99B（Lite）/ 1.2KB（完整版）
- `ads/resource` 23.7KB → 2B
- `note/widgets` 3.2KB → 746B / 239B
- `search/trending` 5.6KB → 333B
- `videofeed` 86.9KB → 67.4KB（丢弃 1 条真广告，保留项无损）

---

## 六、测试

| 测试 | 内容 | 结果 |
|---|---|---|
| `test_equivalence.mjs` | 180 个手工用例，重构前后逐字节对比 | 通过 |
| `test_fuzz.mjs` | 600 轮随机结构 × 10 接口 = 6000 次比较 | 通过（预期修复差异 56 处全部为音频字段保留，非预期 0） |
| `test_fixes.mjs` | 22 项，基于真实抓包样本断言修复效果与匹配范围 | 通过 |
| `test_lite.mjs` / `test_scripts.mjs` / `test_watermark_v2.mjs` / `test_widgets_lite.mjs` | 原有测试 | 全部通过 |

`test_fuzz.mjs` 的差异白名单只放行 `audio_*` 路径，任何其他行为漂移都会失败。

---

## 七、重构结构（同前次）

```
src/lib/          共享块
src/handlers/     每接口一个 handler（// @include 声明依赖）
src/modules/      模块 YAML 源（# @include 引入公共规则）
testdata/         真实响应样本（6 个，940KB）
build.mjs         node build.mjs 生成 scripts/*.js 与两份 YAML
baseline/         重构前快照
```

脚本 16 → 11（删 5 个死文件）。

---

## 八、仍未处理（需要你决定）

1. **完整版首页脚本对真实 homefeed 零改动**。它只删 `FULL_FEED_REMOVE_KEYS` 里的键并过滤广告，而真实首页这些键一个都没出现。Lite 会清 `has_music`、`poi_id_list` 等。这是定位差异（完整版只打广告），不算缺陷，故未改。
2. **`spider-tracker.xiaohongshu.com` 22 次、`t3.xiaohongshu.com/api/spider` 18 次**。前者被别的模块拦了，后者 200 正常返回。属于埋点不是广告，未加规则。
3. **`live-room.rnote.com` 11 次请求**。响应里没查到广告字段，无证据，未覆盖。
4. **`guide/home_guide` 9 次**。抓包里返回空列表，无法判断是否含推广，未覆盖。
5. 推送远端：按你要求暂不推送。

## 九、回滚

```bash
cd /var/minis/workspace/rednote-egern-main
rm -rf scripts && cp -a baseline/scripts_old scripts
cp -a baseline/RedNote_Remove_Ads.yaml baseline/RedNote_Remove_Ads_Lite.yaml .
```
