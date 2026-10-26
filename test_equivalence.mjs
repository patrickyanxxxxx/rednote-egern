// 差分等价测试：旧脚本(baseline/scripts_old) vs 新脚本(scripts)
// 同一 URL + 同一响应体，输出必须完全一致。用法: node test_equivalence.mjs
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
import * as oldMsgFilter from "./baseline/scripts_old/message_recent_chats_filter.js";
import * as newMsgFilter from "./scripts/message_recent_chats_filter.js";

const API = "https://edith.rnote.com/api/sns/v6";

async function run(fn, url, body) {
  const ctx = { request: { url }, response: { json: async () => structuredClone(body) } };
  const out = await fn(ctx);
  return out === undefined ? "<undefined>" : JSON.stringify(out.body);
}

let pass = 0;
const fails = [];

async function compare(label, oldFn, newFn, url, body) {
  const a = await run(oldFn, url, body);
  const b = await run(newFn, url, body);
  if (a === b) { pass += 1; return; }
  fails.push({ label, url, old: a, new: b, input: JSON.stringify(body) });
}

// ---------- 语料 ----------
const media = () => ({
  media_save_config: { disable_save: true, disable_watermark: false, disable_weibo_cover: true },
  function_switch: [
    { type: "image_download", enable: false, reason: "no_permission" },
    { type: "video_download", enable: false, reason: "no_permission" },
    { type: "copy_link", enable: true },
  ],
  share_info: { function_entries: [{ type: "copy_link" }] },
});

const noteItem = (extra = {}) => ({
  id: "n1", model_type: "note", title: "t", desc: "d",
  ip_location: "辽宁",
  music_info: { name: "m" }, poi: { name: "p" }, collection_info: {},
  related_search: [], audio_info: { codec: "aac" },
  media_save_config: { disable_save: true },
  ...extra,
});

const feedBodies = {
  homefeed: { code: 0, data: [noteItem(), noteItem({ model_type: "live_v2" }), noteItem({ ads_info: {} }), noteItem({ card_icon: "x" }), noteItem({ note_attributes: ["goods"] }), noteItem({ has_related_goods: true }), noteItem({ is_ad: true }), noteItem({ is_ads: "1" }), noteItem({ is_sponsored: true }), noteItem({ sponsored: "true" }), noteItem({ promoted: 1 }), noteItem({ model_type: "ads" }), noteItem({ display_type: "native_ad" }), noteItem({ recommend_reason: "ad_boost" }), noteItem({ recommend_reason: "friend_post" }), noteItem({ recommend_reason: "recommend_user" })] },
  homefeedWrap: { code: 0, data: { items: [noteItem(), noteItem({ ads_info: {} })], notes: [noteItem({ is_ad: 1 })], cards: [noteItem()], other: [noteItem({ is_ad: true })] } },
  followfeed: { code: 0, data: { items: [noteItem({ recommend_reason: "friend_post" }), noteItem({ recommend_reason: "recommend_user" }), noteItem()] } },
  followings: { code: 0, data: { items: [noteItem({ recommend_reason: "friend_post" }), noteItem({ recommend_reason: "other" })] } },
  recUsers: { code: 0, data: { rec_users: [{ id: 1 }, { id: 2 }] } },
  scalar: { code: 0, data: { a: 1 } },
  noData: { code: 0 },
};

const videoBodies = {
  mixed: { code: 0, data: [noteItem(), noteItem({ model_type: "live_v2" }), noteItem({ model_type: "video" }), noteItem({ ad: {} }), noteItem({ ads_info: {} }), noteItem({ ad_info: {} }), noteItem({ is_ad: true }), noteItem({ is_ads: "true" }), noteItem({ is_ads: "1" }), noteItem({ card_icon: "x" }), noteItem({ note_attributes: ["goods"] }), noteItem({ has_related_goods: true }), null, "str"] },
  notArray: { code: 0, data: { items: [noteItem()] } },
};

const widgetBodies = {
  sections: { code: 0, data: { widgets: [{ biz_type: "ndb_poi" }, { biz_type: "note_collection" }, { biz_type: "unknown" }, { title: "猜你想搜" }, { model: { title: "加入粉丝群" } }, { name: "正常组件" }], second_jump_bar: { type: "ads" }, second_jump_bar2: { type: "x" }, ads_goods_cards: [], pin_search_highlights: 1, generic: { pin_search_highlights: 2 } } },
  nested: { code: 0, data: [{ biz_type: "poi", inner: [{ biz_type: "ndb_music" }, { title: "猜你想搜" }] }] },
};

const noteBodies = {
  detail: { code: 0, data: { note_list: [noteItem(), noteItem({ music: {}, location: {}, coordinates: {}, series: {}, album: {} })] } },
  media: { code: 0, data: { note: { ...noteItem(), share_info: { function_entries: [] }, function_switch: [{ type: "video_download", enable: false }] } } },
};

const searchBodies = {
  notes: { code: 0, data: { items: [{ model_type: "note" }, { model_type: "ads" }, { model_type: "video" }, { model_type: "user" }, { model_type: "" }, {}] } },
  banner: { code: 0, data: { banner: [] } },
  hot: { code: 0, data: { items: [1, 2], queries: ["a"] } },
  hint: { code: 0, data: { hint_words: ["x"], other: 1 } },
  trending: { code: 0, data: { queries: ["a"], hint_word: { k: 1 }, items: [1] } },
};

const messageBodies = {
  recommend: { code: 0, data: { message_list: [{ model_type: "recommend_user" }, { model_type: "chat" }], recommend_users: [1], sections: [{ title: "你可能感兴趣的人" }], nested: { people_you_may_know: [1] } } },
  plain: { code: 0, data: { message_list: [{ model_type: "chat", title: "hi" }] } },
};

const systemBodies = {
  splash: { code: 0, data: { splash: {}, splash_config: {}, ads_groups: [], marketing: {}, generic: {}, widget_list: [], keep_me: 1 } },
  notObject: { code: 0, data: "str" },
};

const detectBody = { code: 0, data: { subNotificationCommercial: { count: 5, latest: { title: "a", time: 1 } }, subNotificationEvent: { count: 2 }, other: 1 } };

// ---------- 逐对比较 ----------
const cases = [];

for (const [name, body] of Object.entries(feedBodies)) {
  const urls = [`${API}/homefeed`, `${API}/homefeed?x=1`, `${API}/followfeed`, `${API}/user/followings/followfeed`, `${API}/recommend/user/follow_recommend`, `${API}/other`];
  for (const url of urls) cases.push([`feed-lite/${name}`, oldFeedLite, newFeedLite, url, body]);
  for (const url of urls) cases.push([`feed-full/${name}`, oldFeed, newFeed, url, body]);
}
for (const [name, body] of Object.entries(videoBodies)) {
  cases.push([`video/${name}`, oldVideo, newVideo, `${API}/note/videofeed`, body]);
}
for (const [name, body] of Object.entries(widgetBodies)) {
  cases.push([`widgets/${name}`, oldWidgets, newWidgets, `${API}/note/widgets`, body]);
}
for (const [name, body] of Object.entries(noteBodies)) {
  for (const url of [`${API}/note/detailfeed`, `${API}/note/feed`, `${API}/note/imagefeed`, `${API}/note/videofeed`, `${API}/v3/note/videofeed`, `${API}/v4/note/videofeed`]) {
    cases.push([`note-display/${name}`, oldNoteDisplay, newNoteDisplay, url, body]);
    cases.push([`note-full/${name}`, oldNote, newNote, url, body]);
  }
}
for (const [name, body] of Object.entries(searchBodies)) {
  const urls = [`${API}/search/notes`, `${API}/search/banner_list`, `${API}/search/hot_list`, `${API}/search/hint`, `${API}/search/trending`, `${API}/search/other`];
  for (const url of urls) {
    cases.push([`search-full/${name}`, oldSearch, newSearch, url, body]);
    cases.push([`search-lite/${name}`, oldSearchLite, newSearchLite, url, body]);
  }
}
for (const [name, body] of Object.entries(messageBodies)) {
  cases.push([`messages/${name}`, oldMessages, newMessages, `${API}/message`, body]);
}
for (const [name, body] of Object.entries(systemBodies)) {
  cases.push([`system/${name}`, oldSystem, newSystem, `${API}/system/config`, body]);
}
cases.push(["detect/match", oldMsgFilter, newMsgFilter, `${API}/message/detect`, detectBody]);
cases.push(["detect/noMatch", oldMsgFilter, newMsgFilter, `${API}/message/other`, detectBody]);

// 异常输入：json() 抛错
cases.push(["error/throw", oldFeedLite, newFeedLite, `${API}/homefeed`, null]);
cases.push(["error/throw-video", oldVideo, newVideo, `${API}/note/videofeed`, null]);

for (const [label, o, n, url, body] of cases) {
  if (body === null) {
    const ctx = { request: { url }, response: { json: async () => { throw new Error("bad json"); } } };
    const a = await o.default(ctx) === undefined ? "<undefined>" : "body";
    const b = await n.default(ctx) === undefined ? "<undefined>" : "body";
    if (a === b) pass += 1; else fails.push({ label, url, old: a, new: b, input: "throw" });
    continue;
  }
  await compare(label, o.default, n.default, url, body);
}

console.log(`用例总数 ${pass + fails.length}，一致 ${pass}，不一致 ${fails.length}`);
if (fails.length) {
  for (const f of fails.slice(0, 5)) {
    console.log(`\n[FAIL] ${f.label} ${f.url}`);
    console.log(`  in : ${f.input.slice(0, 300)}`);
    console.log(`  old: ${String(f.old).slice(0, 300)}`);
    console.log(`  new: ${String(f.new).slice(0, 300)}`);
  }
  process.exit(1);
}
console.log("等价性通过：新旧输出逐字节一致");
