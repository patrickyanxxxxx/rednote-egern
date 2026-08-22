const AD_MODELS = new Set([
  "ad", "ads", "advertisement", "commercial", "sponsor", "sponsored",
  "promotion", "promoted_note", "brand_ad", "feed_ad", "native_ad"
]);

function isObject(value) {
  return value !== null && typeof value === "object";
}

function isAd(item) {
  if (!isObject(item)) return false;
  if (item.ads_info || item.ad_info || item.advertisement_info || item.promotion_info) return true;

  const candidates = [
    item.model_type, item.card_type, item.item_type, item.type,
    item.note_type, item.content_type, item.display_type
  ];
  if (candidates.some(v => typeof v === "string" && AD_MODELS.has(v.toLowerCase()))) return true;

  const labels = [item.is_ad, item.is_ads, item.is_sponsored, item.sponsored, item.promoted];
  if (labels.some(v => v === true || v === 1 || v === "1" || v === "true")) return true;

  const reason = String(item.recommend_reason || item.recommend_type || "").toLowerCase();
  return /(^|[_-])(ad|ads|sponsor|commercial|promotion)([_-]|$)/.test(reason);
}

function cleanArrays(node) {
  if (!isObject(node)) return;
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) {
      node[key] = value.filter(item => !isAd(item));
      for (const item of node[key]) cleanArrays(item);
    } else if (isObject(value)) {
      cleanArrays(value);
    }
  }
}

function cleanSearch(data) {
  const items = data?.data?.items;
  if (!Array.isArray(items)) return;
  data.data.items = items.filter(item => {
    if (isAd(item)) return false;
    const model = String(item?.model_type || "").toLowerCase();
    return !model || model === "note" || model === "video";
  });
}

function cleanSplash(data) {
  const root = data?.data;
  if (!isObject(root)) return;
  for (const key of ["splash", "splash_config", "loading_img", "ads_groups", "advertisements", "ad_list"]) {
    if (key in root) delete root[key];
  }
}

function cleanUi(data) {
  const root = data?.data;
  if (!isObject(root)) return;
  for (const key of ["cooperate_binds", "generic", "note_next_step", "widget_list", "marketing", "promotion"]) {
    if (key in root) delete root[key];
  }
}

function cleanRelatedSearch(node) {
  if (!isObject(node)) return;
  const relatedKeys = new Set([
    "related_ques", "related_questions", "related_search", "related_searches",
    "related_queries", "related_query", "search_recommend", "search_recommendations",
    "recommend_search", "recommend_searches"
  ]);
  for (const key of Object.keys(node)) {
    if (relatedKeys.has(key)) {
      delete node[key];
    } else if (Array.isArray(node[key])) {
      for (const item of node[key]) cleanRelatedSearch(item);
    } else if (isObject(node[key])) {
      cleanRelatedSearch(node[key]);
    }
  }
}

function cleanNativeMusic(node) {
  if (!isObject(node)) return;
  const musicKeys = new Set([
    "music", "music_info", "music_info_v2", "music_info_list", "note_music",
    "native_music", "native_music_info", "music_id", "music_name", "music_url",
    "music_track", "music_track_info", "audio_info"
  ]);
  for (const key of Object.keys(node)) {
    if (musicKeys.has(key)) {
      delete node[key];
    } else if (Array.isArray(node[key])) {
      for (const item of node[key]) cleanNativeMusic(item);
    } else if (isObject(node[key])) {
      cleanNativeMusic(node[key]);
    }
  }
}

export default async function(ctx) {
  const url = ctx.request?.url || "";
  let data;
  try {
    data = await ctx.response.json();
  } catch (_) {
    return;
  }

  if (/\/search\/banner_list(?:\?|$)/.test(url)) {
    if (data?.data !== undefined) data.data = {};
  } else if (/\/search\/hot_list(?:\?|$)/.test(url)) {
    if (data?.data && Array.isArray(data.data.items)) data.data.items = [];
  } else if (/\/search\/hint(?:\?|$)/.test(url)) {
    if (data?.data) data.data.hint_words = [];
  } else if (/\/search\/trending(?:\?|$)/.test(url)) {
    if (data?.data) {
      data.data.queries = [];
      data.data.hint_word = {};
    }
  }

  if (/\/search\/notes(?:\?|$)/.test(url)) cleanSearch(data);
  if (/\/system_service\/(?:config|splash_config)(?:\?|$)/.test(url)) cleanSplash(data);
  if (/\/system\/service\/ui\/config(?:\?|$)|\/note\/widgets(?:\?|$)/.test(url)) cleanUi(data);

  // Feed schemas vary between RedNote regions and app releases. Remove only
  // entries carrying explicit advertising markers, including nested lists.
  cleanArrays(data);
  cleanRelatedSearch(data);
  cleanNativeMusic(data);
  return { body: data };
}
