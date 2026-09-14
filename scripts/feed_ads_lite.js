const AD_MODELS = new Set([
  "ad", "ads", "advertisement", "commercial", "sponsor", "sponsored",
  "promotion", "promoted_note", "brand_ad", "feed_ad", "native_ad"
]);

const REMOVE_KEYS = [
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "search_recommend", "recommend_search", "music",
  "music_info", "music_info_v2", "note_music", "native_music",
  "native_music_info", "music_track", "audio_info"
];

function isObject(value) {
  return value !== null && typeof value === "object";
}

function marked(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

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
    Object.prototype.hasOwnProperty.call(item, "ads_info") ||
    Object.prototype.hasOwnProperty.call(item, "card_icon") ||
    (Array.isArray(item.note_attributes) && item.note_attributes.includes("goods")) ||
    item.has_related_goods === true;
}

function cleanItem(item) {
  if (!isObject(item)) return;
  for (const key of REMOVE_KEYS) delete item[key];
}

function cleanArray(items, homefeed) {
  const kept = items.filter(item => !isAd(item) && (!homefeed || !isHomefeedPromotion(item)));
  for (const item of kept) cleanItem(item);
  return kept;
}

function cleanKnownArrays(data, homefeed) {
  if (Array.isArray(data)) return cleanArray(data, homefeed);
  if (!isObject(data)) return;
  for (const key of ["items", "notes", "cards"]) {
    if (Array.isArray(data[key])) data[key] = cleanArray(data[key], homefeed);
  }
}

export default async function(ctx) {
  const url = ctx.request?.url || "";
  try {
    const data = await ctx.response.json();
    const homefeed = /\/homefeed(?:\?|$)/.test(url);
    if (Array.isArray(data?.data)) {
      data.data = cleanArray(data.data, homefeed);
    } else {
      cleanKnownArrays(data?.data, homefeed);
    }

    if (/\/user\/followings\/followfeed(?:\?|$)/.test(url) && Array.isArray(data?.data?.items)) {
      data.data.items = data.data.items.filter(item => item?.recommend_reason === "friend_post");
    } else if (/\/followfeed(?:\?|$)/.test(url) && Array.isArray(data?.data?.items)) {
      data.data.items = data.data.items.filter(item => item?.recommend_reason !== "recommend_user");
    } else if (/\/recommend\/user\/follow_recommend(?:\?|$)/.test(url) && Array.isArray(data?.data?.rec_users)) {
      data.data.rec_users = [];
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
