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

const AD_MODELS = new Set([
  "ad", "ads", "advertisement", "commercial", "sponsor", "sponsored",
  "promotion", "promoted_note", "brand_ad", "feed_ad", "native_ad"
]);

function isAd(item) {
  if (!isObject(item)) return false;
  if (item.ads_info || item.ad_info || item.advertisement_info || item.promotion_info) return true;
  if (marked(item.is_ad) || marked(item.is_ads) || marked(item.is_sponsored) ||
      marked(item.sponsored) || marked(item.promoted)) return true;
  const types = [item.model_type, item.card_type, item.item_type, item.type, item.display_type];
  if (types.some(value => typeof value === "string" && AD_MODELS.has(value.toLowerCase()))) return true;
  const reason = String(item.recommend_reason || item.recommend_type || "").toLowerCase();
  return /(^|[_-])(ad|ads|sponsor|commercial|promotion)([_-]|$)/.test(reason);
}

function isHomefeedPromotion(item) {
  if (!isObject(item)) return false;
  return item.model_type === "live_v2" ||
    hasOwn(item, "ads_info") ||
    hasOwn(item, "card_icon") ||
    (Array.isArray(item.note_attributes) && item.note_attributes.includes("goods")) ||
    item.has_related_goods === true;
}

// 完整版笔记脚本沿用的保守清单
const FULL_NOTE_REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "related_query", "search_recommend", "search_recommendations",
  "recommend_search", "recommend_searches", "music", "music_info",
  "music_info_v2", "music_info_list", "note_music", "native_music",
  "native_music_info", "music_id", "music_name", "music_url", "music_track",
  "music_track_info"
]);

// 完整版信息流脚本沿用的保守清单
const FULL_FEED_REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "search_recommend", "recommend_search", "music",
  "music_info", "music_info_v2", "note_music", "native_music",
  "native_music_info", "music_track", "audio_info"
]);

function clean(node) {
  if (!isObject(node)) return;
  for (const key of Object.keys(node)) {
    if (FULL_FEED_REMOVE_KEYS.has(key)) {
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

    if (/\/v6\/homefeed(?:\?|$)/.test(url) && Array.isArray(data?.data)) {
      data.data = data.data.filter(item => !isHomefeedPromotion(item));
    }

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
