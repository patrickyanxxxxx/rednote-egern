// 基于真实抓包样本的修复验证（样本来源：2026-10-27 Surge HAR，模块未启用时的原始响应）
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const S = "testdata/";
if (!existsSync(S)) {
  console.log("跳过真实 HAR 样本测试：未提供 testdata/。其余回归测试仍可运行。");
  process.exit(0);
}
const load = f => JSON.parse(readFileSync(S + f, "utf8"));
const require = createRequire(import.meta.url);

async function run(mod, url, body) {
  const fn = (await import(`./scripts/${mod}`)).default;
  const out = await fn({ request: { url }, response: { json: async () => structuredClone(body) } });
  return out === undefined ? null : out.body;
}

let pass = 0;
const fails = [];
const check = (name, ok, detail = "") => {
  if (ok) { pass += 1; console.log(`  ✅ ${name}`); }
  else { fails.push(name); console.log(`  ❌ ${name} ${detail}`); }
};

const countAudio = o => (JSON.stringify(o).match(/audio_(?:codec|bitrate|duration|channels)/g) || []).length;

console.log("1. 首页媒体字段保留（原缺陷：audio_* 被当音乐字段删除）");
{
  const body = load("rec.rnote.com_api_sns_vN_homefeed.json");
  const out = await run("feed_ads_lite_v2.js", "https://rec.rnote.com/api/sns/v6/homefeed", body);
  check(`音频字段 ${countAudio(body)} 个全部保留`, countAudio(body) === countAudio(out), `${countAudio(body)} -> ${countAudio(out)}`);
  check("条目数不变（20）", out.data.length === 20);
  check("has_music 仍被清理", !("has_music" in out.data[0]));
}

console.log("\n2. 视频流只丢弃真实广告");
{
  const body = load("rec.rnote.com_api_sns_vN_note_videofeed.json");
  const out = await run("videofeed_ads_fast_v2.js", "https://rec.rnote.com/api/sns/v4/note/videofeed", body);
  const hadAdKey = body.data.filter(i => "ad" in i).map(i => i.id);
  const keptBefore = body.data.filter(i => !hadAdKey.includes(i.id));
  check(`丢弃 1 条（有 ad 键的）`, out.data.length === 4, `实际 ${out.data.length}`);
  check("保留项都不含被丢弃的 id", !out.data.some(i => hadAdKey.includes(i.id)));
  check("保留项音频字段未丢", countAudio(keptBefore) === countAudio(out.data), `${countAudio(keptBefore)} -> ${countAudio(out.data)}`);
}

console.log("\n3. 消息页只处理私信列表，不碰 emoji 配置");
{
  const body = load("edith.rnote.com_api_im_emoji_config.json");
  const out = await run("messages.js", "https://edith.rnote.com/api/im/emoji/config", body);
  check("emoji 配置未被改动", JSON.stringify(body) === JSON.stringify(out));
}

console.log("\n4. 组件净化仍然生效");
{
  const body = load("edith.rnote.com_api_sns_vN_note_widgets.json");
  const out = await run("widgets_lite_v2.js", "https://edith.rnote.com/api/sns/v2/note/widgets", body);
  check("ndb_sound 组件被移除", !JSON.stringify(out).includes("ndb_sound"));
}

console.log("\n5. 去水印保存仍然生效");
{
  const body = load("edith.rnote.com_api_sns_vN_note_imagefeed.json");
  const out = await run("note_display_lite_v2.js", "https://edith.rnote.com/api/sns/v1/note/imagefeed", body);
  check("disable_watermark 被置 true", JSON.stringify(out).includes('"disable_watermark":true'));
}

console.log(`\n通过 ${pass}，失败 ${fails.length}`);
if (fails.length) { console.log("失败项:", fails.join(", ")); process.exit(1); }

console.log("\n6. 搜索热榜按真实层级清空（原缺陷：清错层级且新增空键）");
{
  const body = load("edith.rnote.com_api_sns_vN_search_trending.json");
  const out = await run("search_ads_lite.js", "https://edith.rnote.com/api/sns/v4/search/trending", body);
  check("queries 被清空", out.data.data.queries.length === 0);
  check("hint_word 被清空", Object.keys(out.data.data.hint_word).length === 0);
  check("体积下降", JSON.stringify(out).length < JSON.stringify(body).length);
}

console.log("\n7. 模块匹配范围（防止过度匹配回退）");
{
  const fs = await import("node:fs");
  const unquote = s => s.replace(/^"|"$/g, "").replace(/\\\\/g, "\\").replace(/\\"/g, '"');
  const matches = f => fs.readFileSync(f, "utf8").split("\n")
    .filter(l => /^\s+match: "/.test(l))
    .map(l => unquote(l.trim().replace(/^match: /, "")));
  const lite = matches("RedNote_Remove_Ads_Lite.yaml");
  const full = matches("RedNote_Remove_Ads.yaml");
  const hit = (pats, url) => pats.some(p => new RegExp(p).test(url));

  check("preload 被 Lite 覆盖", hit(lite, "https://edith.rnote.com/api/sns/v1/note/detailfeed/preload"));
  check("preload 被完整版覆盖", hit(full, "https://edith.rnote.com/api/sns/v1/note/detailfeed/preload"));
  check("homefeed/categories 不再被误匹配", !hit(lite, "https://rec.rnote.com/api/sns/v6/homefeed/categories") && !hit(full, "https://rec.rnote.com/api/sns/v6/homefeed/categories"));
  check("client_downgrade/report 不再被误匹配", !hit(lite, "https://edith.rnote.com/api/sns/v1/homefeed/client_downgrade/report"));
  check("emoji/config 不再被误匹配", !hit(full, "https://edith.rnote.com/api/im/emoji/config"));
  check("smiles/hot 不再被误匹配", !hit(full, "https://edith.rnote.com/api/im/smiles/hot"));
  check("flag_exp 不再被误匹配", !hit(full, "https://edith.rnote.com/api/sns/v3/system_service/flag_exp"));
  check("私信列表仍被完整版覆盖", hit(full, "https://edith.rnote.com/api/sns/v1/im/get_recent_chats"));
  check("消息页推广仍被 Lite 覆盖", hit(lite, "https://edith.rnote.com/api/sns/v6/message/detect"));
  check("开屏配置仍被完整版覆盖", hit(full, "https://edith.rnote.com/api/sns/v2/system_service/splash_config"));
}
