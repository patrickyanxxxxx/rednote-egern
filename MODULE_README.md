# RedNote Egern 模块详细说明

当前发行版：`v2026.10.27`，抓包适配基线：RedNote 国际版 9.52。

本文件说明两份 Egern 模块的覆盖范围、选择方式、脚本匹配和更新方法。普通使用者优先看主 [README.md](README.md)；需要排查某个接口时再看这里。

## 两个模块怎么选

| 模块 | 适合场景 | 处理范围 | 建议 |
|---|---|---|---|
| `RedNote_Remove_Ads_Lite.yaml` | 日常使用、优先稳定和响应速度 | 开屏、信息流、视频流、搜索、组件、图片保存/去水印、消息页推广计数 | **默认推荐** |
| `RedNote_Remove_Ads.yaml` | 需要评论、详情和私信推荐用户净化 | Lite 的主要广告处理，加上完整版笔记/评论/私信响应净化 | 有明确需求再用 |

Lite 会绕过评论和私信的重型递归改写，只处理明确的消息页推广计数接口。它的响应改写范围更小，适合长期运行。

完整版会额外处理：

- `note/detailfeed`、`note/feed`、`note/imagefeed`、`note/videofeed`
- `note/comment`、`interaction/comment`
- 私信首页列表中的推荐用户结构
- 系统配置和界面组件的广告字段

两个版本都包含本次发行的媒体字段修复、搜索热榜修复、`detailfeed/preload` 覆盖、广告资源 map_local 和匹配范围收窄。

## 使用地址

Lite：

```text
https://raw.githubusercontent.com/patrickyanxxxxx/rednote-egern/main/RedNote_Remove_Ads_Lite.yaml
```

完整版：

```text
https://raw.githubusercontent.com/patrickyanxxxxx/rednote-egern/main/RedNote_Remove_Ads.yaml
```

在 Egern 中更新模块后，刷新模块并彻底关闭、重新打开 RedNote。若脚本仍是旧版本，删除同一模块后重新添加。

## Lite 覆盖接口

| 类型 | 匹配接口 | 处理方式 |
|---|---|---|
| 消息页推广 | `/api/sns/vN/message/detect` | 清空商业/活动通知计数和最新消息 |
| 首页与关注流 | `homefeed`、`followfeed`、`user/followings/followfeed`、`recommend/user/follow_recommend` | 删除广告卡片、推荐用户卡片和展示扩展字段 |
| 视频流 | `note/videofeed` | 删除真实广告条目，保留媒体描述字段，恢复下载入口 |
| 笔记展示 | `note/detailfeed`、`note/detailfeed/preload`、`note/feed`、`note/imagefeed` | 去除相关组件并调整保存/去水印权限 |
| 组件 | `note/widgets` | 删除相关搜索、活动、地点、音乐、合集和粉丝群组件 |
| 搜索 | `/search/` 下的搜索结果、横幅、热榜、提示、趋势接口 | 删除广告结果、横幅、趋势词和相关推荐 |
| 评论图片 | `/note/comment/list`、`/note/comment/sub_comments` | 只改写 `pictures[].url` / `origin_url` 为评论图原链，不递归改写整条评论 |

Lite 的 feed 匹配带有路径结束锚点，因此不会处理 `homefeed/categories` 或 `homefeed/client_downgrade/report`。搜索模块也不会处理无关的搜索子接口。

## 完整版额外覆盖接口

完整版额外使用以下脚本：

| 脚本 | 作用 |
|---|---|
| `feed_ads.js` | 信息流广告、关注流推荐用户和推广字段净化 |
| `search.js` | 完整版搜索结果与趋势词净化 |
| `system.js` | 开屏和指定系统配置净化；已排除大型 `flag_exp` 实验配置 |
| `note.js` | 笔记、视频、评论和保存权限处理 |
| `messages.js` | 仅处理私信列表相关接口，不再扫描整个 `/api/im/*` |

完整版的私信匹配限制在 `im/get_recent_chats`、`im/vN/chats` 和 `sns/vN/message`，不会扫描 emoji 配置、表情热榜、未读状态等无关响应。

## 本次发行修复

### 媒体描述字段

旧逻辑会把 `audio_codec`、`audio_bitrate`、`audio_duration`、`audio_channels` 当成音乐字段删除。真实 homefeed 响应中曾一次删除 92 个媒体字段。

现在媒体描述字段由白名单保护，视频播放器所需的编码、码率、时长和声道信息会保留。

### 搜索热榜层级

真实热榜结构位于 `data.data.queries` 和 `data.data.hint_word`。现在会清理真实层级，避免旧逻辑清错层级并新增无用空键。

### 匹配范围

以下接口已明确排除：

- `homefeed/categories`
- `homefeed/client_downgrade/report`
- `api/im/emoji/config`
- `api/im/smiles/hot`
- `api/sns/*/system_service/flag_exp`

这些接口此前会触发无意义的大响应递归扫描。

### 规则补全

新增或统一以下处理：

- `ads-img-bak.xhscdn.com`
- `im/vN/get_banner_list`
- `note/detailfeed/preload`
- 完整版的 `ads/resource`
- 完整版的 `content/video/get_ads_info`

## 源码和生成

Egern 的 `script_url` 是单文件加载，不能直接使用 JavaScript `import`。源码采用共享块展开方式：

```text
src/lib/          共享函数、广告判定和字段清单
src/handlers/     每个接口的源 handler
src/modules/      两份 YAML 源文件和公共规则
scripts/          生成后的 Egern 自包含脚本
RedNote_*.yaml    生成后的模块文件
build.mjs         生成器
```

修改 `src/` 后运行：

```bash
node build.mjs
```

不要直接编辑 `scripts/` 或根目录 YAML；下一次构建会覆盖这些产物。

## 验证

本发行版已经通过：

- 原有 Lite、完整版、去水印和组件测试
- 180 个新旧行为对照用例
- 6000 次随机结构差分比较
- 22 项真实 HAR 响应修复断言
- 1495 请求 HAR 的端到端样本模拟

真实抓包样本来自 2026-10-27，测试时模块未启用，适合作为原始响应基线。样本保留在本地分析工作区，不随公开仓库发布；缺少 `testdata/` 时，真实样本测试会明确跳过。完整分析报告见 [REFACTOR_REPORT.md](REFACTOR_REPORT.md)。

## 回滚

如果更新后需要恢复上一版，Egern 中重新拉取旧模块内容即可。源码工作区还保留了 `baseline/` 快照，供维护者做本地对照。
