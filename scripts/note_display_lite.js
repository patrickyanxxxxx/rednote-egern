const REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "related_query", "search_recommend", "search_recommendations",
  "recommend_search", "recommend_searches", "music", "music_info",
  "music_info_v2", "music_info_list", "note_music", "native_music",
  "native_music_info", "music_id", "music_name", "music_url", "music_track",
  "music_track_info", "poi_info", "poi_info_list", "location_info", "location",
  "place_info", "place", "address_info", "collection_info", "note_collection",
  "note_collection_info", "collection", "series_info", "series", "album_info", "album"
]);

const CHILD_KEYS = new Set([
  "data", "note", "note_card", "note_info", "items", "notes", "cards",
  "feeds", "feed", "result", "results"
]);

function isObject(value) {
  return value !== null && typeof value === "object";
}

function looksLikeNote(node) {
  if (!isObject(node)) return false;
  return node.model_type === "note" || node.note_id !== undefined ||
    node.note_card !== undefined || node.note_info !== undefined ||
    node.image_list !== undefined || node.video !== undefined ||
    node.video_info !== undefined;
}

function enableSaving(node) {
  if (isObject(node.media_save_config)) {
    node.media_save_config.disable_save = false;
    node.media_save_config.disable_watermark = true;
    node.media_save_config.disable_weibo_cover = true;
  }
  if (Array.isArray(node.function_switch)) {
    for (const item of node.function_switch) {
      if (item?.type === "image_download" || item?.type === "video_download") {
        item.enable = true;
        delete item.reason;
      }
    }
  }
  if (Array.isArray(node.share_info?.function_entries) &&
      !node.share_info.function_entries.some(item => item?.type === "video_download")) {
    node.share_info.function_entries.push({ type: "video_download" });
  }
}

function cleanNote(node) {
  if (!looksLikeNote(node)) return;
  for (const key of REMOVE_KEYS) delete node[key];
  enableSaving(node);
}

function walkKnown(node, depth) {
  if (!isObject(node) || depth > 3) return;
  if (Array.isArray(node)) {
    for (const item of node) walkKnown(item, depth);
    return;
  }
  cleanNote(node);
  for (const key of Object.keys(node)) {
    if (!CHILD_KEYS.has(key)) continue;
    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) walkKnown(item, depth + 1);
    } else if (isObject(value)) {
      walkKnown(value, depth + 1);
    }
  }
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    walkKnown(data, 0);
    return { body: data };
  } catch (_) {
    return;
  }
}
