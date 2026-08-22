function isObject(value) {
  return value !== null && typeof value === "object";
}

function clean(node) {
  if (!isObject(node)) return;
  const removeKeys = new Set([
    "related_ques", "related_questions", "related_search", "related_searches",
    "related_queries", "related_query", "search_recommend", "search_recommendations",
    "recommend_search", "recommend_searches", "music", "music_info",
    "music_info_v2", "music_info_list", "note_music", "native_music",
    "native_music_info", "music_id", "music_name", "music_url", "music_track",
    "music_track_info", "audio_info"
  ]);
  for (const key of Object.keys(node)) {
    if (removeKeys.has(key)) {
      delete node[key];
    } else if (Array.isArray(node[key])) {
      for (const item of node[key]) clean(item);
    } else if (isObject(node[key])) {
      clean(node[key]);
    }
  }
}

function isVideoFeedPromotion(item) {
  if (!isObject(item)) return true;
  if (item.model_type !== "note") return true;
  if (Object.prototype.hasOwnProperty.call(item, "ad")) return true;
  if (item.ads_info || item.ad_info || item.is_ads === true || item.is_ads === 1 || item.is_ads === "1") return true;
  if (item.model_type === "live_v2") return true;
  if (Object.prototype.hasOwnProperty.call(item, "card_icon")) return true;
  if (Array.isArray(item.note_attributes) && item.note_attributes.includes("goods")) return true;
  return item.has_related_goods === true;
}

function cleanVideoFeed(data, version) {
  if (!Array.isArray(data?.data)) return;
  if (version === 4) {
    data.data = data.data.filter(item => !isVideoFeedPromotion(item));
  } else {
    data.data = data.data.filter(item => {
      if (!isObject(item)) return false;
      if (item.model_type === "live_v2") return false;
      if (Object.prototype.hasOwnProperty.call(item, "ad")) return false;
      if (item.ads_info || item.ad_info || item.is_ads === true || item.is_ads === 1 || item.is_ads === "1") return false;
      return true;
    });
  }
}

function unlockMedia(node) {
  if (!isObject(node)) return;
  if (isObject(node.media_save_config)) {
    node.media_save_config.disable_save = false;
    node.media_save_config.disable_watermark = true;
    node.media_save_config.disable_weibo_cover = true;
  }
  if (Array.isArray(node.function_switch)) {
    for (const item of node.function_switch) {
      if (["image_download", "video_download"].includes(item?.type)) {
        item.enable = true;
        delete item.reason;
      }
    }
  }
  if (Array.isArray(node.share_info?.function_entries)) {
    const exists = node.share_info.function_entries.some(item => item?.type === "video_download");
    if (!exists) node.share_info.function_entries.push({ type: "video_download" });
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) unlockMedia(item);
    } else if (isObject(value)) {
      unlockMedia(value);
    }
  }
}

export default async function(ctx) {
  const url = ctx.request?.url || "";
  try {
    const data = await ctx.response.json();
    clean(data);
    if (/\/v3\/note\/videofeed(?:\?|$)/.test(url)) cleanVideoFeed(data, 3);
    if (/\/v4\/note\/videofeed(?:\?|$)/.test(url)) cleanVideoFeed(data, 4);
    unlockMedia(data);
    return { body: data };
  } catch (_) {
    return;
  }
}
