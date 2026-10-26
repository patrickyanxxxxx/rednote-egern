// 随机模糊差分测试：种子固定，可复现。用法: node test_fuzz.mjs [轮数]
import * as oldFeed from "./baseline/scripts_old/feed_ads.js";
import * as newFeed from "./scripts/feed_ads.js";
import * as oldFeedLite from "./baseline/scripts_old/feed_ads_lite_v2.js";
import * as newFeedLite from "./scripts/feed_ads_lite_v2.js";
import * as oldVideo from "./baseline/scripts_old/videofeed_ads_fast_v2.js";
import * as newVideo from "./scripts/videofeed_ads_fast_v2.js";
import * as oldNoteDisplay from "./baseline/scripts_old/note_display_lite_v2.js";
import * as newNoteDisplay from "./scripts/note_display_lite_v2.js";
import * as oldNote from "./baseline/scripts_old/note.js";
import * as newNote from "./scripts/note.js";
import * as oldWidgets from "./baseline/scripts_old/widgets_lite_v2.js";
import * as newWidgets from "./scripts/widgets_lite_v2.js";
import * as oldSearch from "./baseline/scripts_old/search.js";
import * as newSearch from "./scripts/search.js";
import * as oldSearchLite from "./baseline/scripts_old/search_ads_lite.js";
import * as newSearchLite from "./scripts/search_ads_lite.js";
import * as oldSystem from "./baseline/scripts_old/system.js";
import * as newSystem from "./scripts/system.js";
import * as oldMessages from "./baseline/scripts_old/messages.js";
import * as newMessages from "./scripts/messages.js";

const ROUNDS = Number(process.argv[2] || 600);
let seed = 0x5eed1234;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = arr => arr[Math.floor(rnd() * arr.length)];
const maybe = p => rnd() < p;

const KEYS = [
  "related_ques", "related_search", "search_recommend", "music", "music_info", "music_info_v2",
  "note_music", "music_track", "audio_info", "poi", "poi_info", "location", "place", "address_info",
  "geo_info", "collection", "note_collection", "series", "album", "album_info", "coordinates",
  "music_id", "music_name", "music_url", "music_info_list", "music_track_info", "search_recommendations",
  "ip_location", "ip_location_city", "ads_goods_cards", "ads_comment_component", "ads_engage_bar",
  "pgy_comment_component", "pgy_engage_bar", "cooperate_engage_bar", "second_jump_bar",
  "pin_search_highlights", "generic", "model", "title", "name", "text", "label", "sub_title",
  "id", "desc", "items", "notes", "cards", "data", "note_list", "message_list", "widgets",
  "media_save_config", "function_switch", "share_info", "function_entries", "model_type",
  "card_type", "item_type", "type", "display_type", "recommend_reason", "recommend_type",
  "ads_info", "ad_info", "advertisement_info", "promotion_info", "ad", "is_ad", "is_ads",
  "is_sponsored", "sponsored", "promoted", "card_icon", "note_attributes", "has_related_goods",
  "biz_type", "source", "module_type", "module_title", "section_title", "rec_users", "keep_me",
  "audio_codec", "audio_bitrate", "audio_duration", "audio_channels", "video_codec", "sample_rate",
  "video_info_v2", "media", "stream", "h264", "h265",
];
const STRINGS = ["note", "ads", "ad", "video", "live_v2", "sponsor", "ad_boost", "friend_post",
  "recommend_user", "suggest", "interest_user", "猜你想搜", "加入粉丝群", "ndb_poi", "poi",
  "note_collection", "ndb_music", "ugc_buyable_poi", "image_download", "video_download", "", "普通文本"];
const SCALARS = [true, false, 0, 1, "1", "true", null, -1, "x"];

function value(depth) {
  const r = rnd();
  if (depth > 6 || r < 0.45) return pick(SCALARS);
  if (r < 0.62) return pick(STRINGS);
  if (r < 0.82) {
    const n = Math.floor(rnd() * 4);
    return Array.from({ length: n }, () => value(depth + 1));
  }
  return obj(depth + 1);
}

function obj(depth) {
  const o = {};
  const n = Math.floor(rnd() * 7);
  for (let i = 0; i < n; i++) o[pick(KEYS)] = value(depth);
  if (maybe(0.25)) o.model_type = pick(STRINGS);
  if (maybe(0.15)) o.is_ads = pick([true, 1, "1", "true", false]);
  if (maybe(0.12)) o.media_save_config = { disable_save: true, disable_watermark: false };
  if (maybe(0.1)) o.function_switch = [{ type: pick(["image_download", "video_download", "copy_link"]), enable: false, reason: "r" }];
  if (maybe(0.1)) o.share_info = { function_entries: maybe(0.5) ? [] : [{ type: "copy_link" }] };
  if (maybe(0.08)) o.biz_type = pick(STRINGS);
  return o;
}

async function run(fn, url, body) {
  try {
    const out = await fn({ request: { url }, response: { json: async () => structuredClone(body) } });
    return out === undefined ? "<undefined>" : JSON.stringify(out.body);
  } catch (e) {
    return `<throw:${e.constructor.name}>`;
  }
}

const API = "https://edith.rnote.com/api/sns/v6";
const suites = [
  ["feed-lite", oldFeedLite.default, newFeedLite.default, [`${API}/homefeed`, `${API}/followfeed`, `${API}/user/followings/followfeed`, `${API}/recommend/user/follow_recommend`]],
  ["feed-full", oldFeed.default, newFeed.default, [`${API}/homefeed`, `${API}/v6/homefeed`, `${API}/followfeed`]],
  ["video", oldVideo.default, newVideo.default, [`${API}/note/videofeed`]],
  ["note-display", oldNoteDisplay.default, newNoteDisplay.default, [`${API}/note/detailfeed`]],
  ["note-full", oldNote.default, newNote.default, [`${API}/v3/note/videofeed`, `${API}/v4/note/videofeed`, `${API}/note/feed`]],
  ["widgets", oldWidgets.default, newWidgets.default, [`${API}/note/widgets`]],
  ["search-full", oldSearch.default, newSearch.default, [`${API}/search/notes`, `${API}/search/banner_list`, `${API}/search/hot_list`, `${API}/search/hint`, `${API}/search/trending`]],
  ["search-lite", oldSearchLite.default, newSearchLite.default, [`${API}/search/notes`, `${API}/search/hot_list`, `${API}/search/hint`, `${API}/search/trending`]],
  ["messages", oldMessages.default, newMessages.default, [`${API}/message`]],
  ["system", oldSystem.default, newSystem.default, [`${API}/system_service/config`, `${API}/system_service/splash_config`]],
];

// 返回 true 表示两棵树的差异只在于媒体描述字段（本次修复的预期变化）
function diffOnlyAudio(a, b) {
  const bad = [];
  const walk = (x, y, path) => {
    if (JSON.stringify(x) === JSON.stringify(y)) return;
    if (typeof x !== "object" || x === null || typeof y !== "object" || y === null) { bad.push(path); return; }
    if (Array.isArray(x) !== Array.isArray(y)) { bad.push(path); return; }
    if (Array.isArray(x)) {
      if (x.length !== y.length) { bad.push(path + "[len]"); return; }
      for (let i = 0; i < x.length; i++) walk(x[i], y[i], `${path}[${i}]`);
      return;
    }
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if (!(k in x) || !(k in y)) { bad.push(`${path}.${k}`); continue; }
      walk(x[k], y[k], `${path}.${k}`);
    }
  };
  walk(a, b, "$");
  if (!bad.length) return false;
  return bad.every(p => /audio_(codec|bitrate|duration|channels)/.test(p));
}

let checked = 0;
let fixed = 0;
const fails = [];
for (let i = 0; i < ROUNDS; i++) {
  const shape = rnd();
  const body = shape < 0.4
    ? { code: 0, data: Array.from({ length: Math.floor(rnd() * 5) }, () => obj(0)) }
    : shape < 0.7
      ? { code: 0, data: obj(0) }
      : obj(0);
  for (const [name, o, n, urls] of suites) {
    const url = pick(urls);
    const a = await run(o, url, body);
    const b = await run(n, url, body);
    checked += 1;
    if (a === b) continue;
    // 预期差异：旧脚本误删媒体描述字段，新脚本保留
    const onlyAudio = diffOnlyAudio(JSON.parse(a === "<undefined>" ? "null" : a), JSON.parse(b === "<undefined>" ? "null" : b));
    if (onlyAudio) { fixed += 1; continue; }
    fails.push({ name, url, body: JSON.stringify(body), a, b });
  }
}

console.log(`模糊轮数 ${ROUNDS}，比较次数 ${checked}，预期修复差异 ${fixed}，非预期不一致 ${fails.length}`);
if (fails.length) {
  for (const f of fails.slice(0, 3)) {
    console.log(`\n[FAIL] ${f.name} ${f.url}`);
    console.log(`  in : ${f.body.slice(0, 400)}`);
    console.log(`  old: ${String(f.a).slice(0, 400)}`);
    console.log(`  new: ${String(f.b).slice(0, 400)}`);
  }
  process.exit(1);
}
console.log("模糊测试通过：新旧输出一致");
