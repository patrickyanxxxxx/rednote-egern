// 本文件由 build.mjs 从 src/ 生成，请勿直接编辑。

function isObject(value) {
  return value !== null && typeof value === "object";
}

function marked(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key);
}

function isVideoPromotion(item) {
  if (!isObject(item)) return true;
  if (item.model_type !== "note") return true;
  if (hasOwn(item, "ad")) return true;
  if (item.ads_info || item.ad_info || marked(item.is_ad) || marked(item.is_ads)) return true;
  if (hasOwn(item, "card_icon")) return true;
  if (Array.isArray(item.note_attributes) && item.note_attributes.includes("goods")) return true;
  return item.has_related_goods === true;
}

function isVideoFeedPromotion(item) {
  if (!isObject(item)) return true;
  if (item.model_type !== "note") return true;
  if (hasOwn(item, "ad")) return true;
  // 与 note.js 原实现严格一致：只认 true / 1 / "1"，不认 "true"
  if (item.ads_info || item.ad_info || item.is_ads === true || item.is_ads === 1 || item.is_ads === "1") return true;
  if (hasOwn(item, "card_icon")) return true;
  if (Array.isArray(item.note_attributes) && item.note_attributes.includes("goods")) return true;
  return item.has_related_goods === true;
}

// 信息流与视频流共用：展示类扩展字段
const FEED_REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "related_query", "search_recommend", "recommend_search",
  "music", "music_info", "music_info_v2", "note_music", "native_music",
  "native_music_info", "music_track", "audio_info", "poi", "poi_info",
  "poi_info_list", "location", "location_info", "place", "place_info",
  "address_info", "geo_info", "collection", "collection_info",
  "note_collection", "note_collection_info", "collect_info", "series",
  "series_info", "album", "album_info"
]);

const DISPLAY_KEY = /(?:related|recommend).*(?:search|question|query)|(?:search|question|query).*(?:related|recommend)|(?:^|_)(?:music|audio|poi|location|place|address|geo|collection|collect|series|album)(?:_|$)/i;

// 媒体描述字段不能当音乐/音频组件删掉，否则播放器拿不到编码参数
const MEDIA_FIELD = /^(?:audio|video)_(?:codec|bitrate|duration|channels|sample_rate|profile|fps|frame_rate|width|height)$/i;

function shouldRemoveDisplayKey(key) {
  if (MEDIA_FIELD.test(key)) return false;
  return !/^ip_location(?:_|$)/i.test(key) && DISPLAY_KEY.test(key);
}

function enableSaving(node) {
  if (isObject(node.media_save_config)) {
    node.media_save_config.disable_save = false;
    node.media_save_config.disable_watermark = true;
    node.media_save_config.disable_weibo_cover = true;
  }

  if (Array.isArray(node.function_switch)) {
    for (const entry of node.function_switch) {
      if (entry?.type === "image_download" || entry?.type === "video_download") {
        entry.enable = true;
        delete entry.reason;
      }
    }
  }

  if (isObject(node.share_info)) {
    if (!Array.isArray(node.share_info.function_entries)) {
      node.share_info.function_entries = [];
    }
    if (!node.share_info.function_entries.some(entry => entry?.type === "video_download")) {
      node.share_info.function_entries.unshift({ type: "video_download" });
    }
  }
}

function cleanVideoItem(item) {
  if (!isObject(item)) return;
  enableSaving(item);
  for (const key of Object.keys(item)) {
    if (/^ip_location(?:_|$)/i.test(key)) continue;
    if (FEED_REMOVE_KEYS.has(key)) delete item[key];
  }
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    if (Array.isArray(data?.data)) {
      data.data = data.data.filter(item => !isVideoPromotion(item));
      for (const item of data.data) cleanVideoItem(item);
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
