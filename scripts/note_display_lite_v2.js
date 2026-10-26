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

function logLite(name, detail) {
  try {
    console.log("[RedNote Lite] " + name + " " + detail);
  } catch (_) {}
}

// 笔记详情：比信息流多一批字段，不能与上面合并
const NOTE_REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "related_query", "search_recommend", "search_recommendations",
  "recommend_search", "recommend_searches", "music", "music_info",
  "music_info_v2", "music_info_list", "note_music", "native_music",
  "native_music_info", "music_id", "music_name", "music_url", "music_track",
  "music_track_info", "poi_info", "poi_info_list", "location_info", "location",
  "place_info", "place", "address_info", "poi", "coordinates", "geo_info",
  "collection_info", "note_collection", "note_collection_info", "collection",
  "series_info", "series", "album_info", "album"
]);

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

function clean(node, depth) {
  if (!isObject(node) || depth > 5) return;
  if (Array.isArray(node)) {
    for (const item of node) clean(item, depth);
    return;
  }

  enableSaving(node);
  for (const key of Object.keys(node)) {
    if (NOTE_REMOVE_KEYS.has(key)) {
      delete node[key];
    } else if (isObject(node[key])) {
      clean(node[key], depth + 1);
    }
  }
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    clean(data, 0);
    logLite("笔记展示字段和去水印", (ctx.request?.url || "").split("?")[0]);
    return { body: data };
  } catch (_) {
    return;
  }
}
