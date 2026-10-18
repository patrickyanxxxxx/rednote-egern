const REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "related_query", "search_recommend", "recommend_search",
  "music", "music_info", "music_info_v2", "note_music", "native_music",
  "native_music_info", "music_track", "audio_info", "poi", "poi_info",
  "poi_info_list", "location", "location_info", "place", "place_info",
  "address_info", "geo_info", "collection", "collection_info",
  "note_collection", "note_collection_info", "collect_info", "series",
  "series_info", "album", "album_info"
]);

function isObject(value) {
  return value !== null && typeof value === "object";
}

function marked(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function isPromotion(item) {
  if (!isObject(item)) return true;
  if (item.model_type !== "note") return true;
  if (Object.prototype.hasOwnProperty.call(item, "ad")) return true;
  if (item.ads_info || item.ad_info || marked(item.is_ad) || marked(item.is_ads)) return true;
  if (item.model_type === "live_v2" || Object.prototype.hasOwnProperty.call(item, "card_icon")) return true;
  if (Array.isArray(item.note_attributes) && item.note_attributes.includes("goods")) return true;
  return item.has_related_goods === true;
}

function enableSaving(item) {
  if (isObject(item.media_save_config)) {
    item.media_save_config.disable_save = false;
    item.media_save_config.disable_watermark = true;
    item.media_save_config.disable_weibo_cover = true;
  }

  if (Array.isArray(item.function_switch)) {
    for (const entry of item.function_switch) {
      if (entry?.type === "image_download" || entry?.type === "video_download") {
        entry.enable = true;
        delete entry.reason;
      }
    }
  }

  if (isObject(item.share_info)) {
    if (!Array.isArray(item.share_info.function_entries)) {
      item.share_info.function_entries = [];
    }
    if (!item.share_info.function_entries.some(entry => entry?.type === "video_download")) {
      item.share_info.function_entries.unshift({ type: "video_download" });
    }
  }
}

function cleanVideoItem(item) {
  if (!isObject(item)) return;
  enableSaving(item);
  for (const key of Object.keys(item)) {
    if (/^ip_location(?:_|$)/i.test(key)) continue;
    if (REMOVE_KEYS.has(key)) delete item[key];
  }
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    if (Array.isArray(data?.data)) {
      data.data = data.data.filter(item => !isPromotion(item));
      for (const item of data.data) cleanVideoItem(item);
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
