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
  const types = [item.model_type, item.card_type, item.item_type, item.type, item.display_type];
  if (types.some(v => typeof v === "string" && AD_MODELS.has(v.toLowerCase()))) return true;
  if ([item.is_ad, item.is_ads, item.is_sponsored, item.sponsored, item.promoted]
      .some(v => v === true || v === 1 || v === "1" || v === "true")) return true;
  const reason = String(item.recommend_reason || item.recommend_type || "").toLowerCase();
  return /(^|[_-])(ad|ads|sponsor|commercial|promotion)([_-]|$)/.test(reason);
}

function clean(node) {
  if (!isObject(node)) return;
  const removeKeys = new Set([
    "related_ques", "related_questions", "related_search", "related_searches",
    "related_queries", "search_recommend", "recommend_search", "music",
    "music_info", "music_info_v2", "note_music", "native_music",
    "native_music_info", "music_track", "audio_info"
  ]);
  for (const key of Object.keys(node)) {
    if (removeKeys.has(key)) {
      delete node[key];
    } else if (Array.isArray(node[key])) {
      node[key] = node[key].filter(item => !isAd(item));
      for (const item of node[key]) clean(item);
    } else if (isObject(node[key])) {
      clean(node[key]);
    }
  }
}

export default async function(ctx) {
  const url = ctx.request?.url || "";
  try {
    const data = await ctx.response.json();
    clean(data);

    if (/\/user\/followings\/followfeed(?:\?|$)/.test(url) && Array.isArray(data?.data?.items)) {
      data.data.items = data.data.items.filter(item => item?.recommend_reason === "friend_post");
    } else if (/\/followfeed(?:\?|$)/.test(url) && Array.isArray(data?.data?.items)) {
      data.data.items = data.data.items.filter(item => item?.recommend_reason !== "recommend_user");
    } else if (/\/recommend\/user\/follow_recommend(?:\?|$)/.test(url)) {
      if (Array.isArray(data?.data?.rec_users)) data.data.rec_users = [];
    }

    return { body: data };
  } catch (_) {
    return;
  }
}
