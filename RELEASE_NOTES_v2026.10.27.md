# RedNote Egern v2026.10.27

适配基线：RedNote 国际版 9.52。

本版同时更新 Lite 与完整版模块。推荐日常使用 Lite；需要评论、详情和私信推荐用户净化时使用完整版。

## 修复

- 修复 Lite 信息流脚本误删 `audio_codec`、`audio_bitrate`、`audio_duration`、`audio_channels` 等视频媒体描述字段。
- 修复 `search/trending` 清错响应层级的问题。真实的 `data.data.queries` 和 `data.data.hint_word` 现在会被正确清空。
- 收窄私信、系统配置和信息流脚本匹配范围，避免扫描 emoji 配置、表情热榜、`flag_exp` 实验配置、`homefeed/categories` 和上报接口。

## 补全

- 覆盖 `note/detailfeed/preload`。
- 拦截 `ads-img-bak.xhscdn.com` 广告图片域名。
- 清空 `im/vN/get_banner_list` 的横幅广告列表。
- 将 `ads/resource` 与 `content/video/get_ads_info` 的本地映射统一提供给两个模块。

## Lite 与完整版

Lite 保留广告过滤、视频快路径、组件净化、图片保存/去水印和消息页推广计数处理，绕过评论和私信的重型递归改写。

完整版额外处理笔记、视频、评论、详情和私信列表响应，但也只对明确的目标接口执行响应改写，不再扫描整个 `/api/im/*` 或所有 `system_service/*` 响应。

## 验证

- 真实 HAR：1495 请求，106 个 JSON 接口样本
- 真实样本修复断言：22 项通过
- 新旧对照：180 个用例通过
- 随机差分：6000 次比较通过
- 原有测试：全部通过

完整接口说明见 [MODULE_README.md](MODULE_README.md)，分析与验证记录见 [REFACTOR_REPORT.md](REFACTOR_REPORT.md)。
