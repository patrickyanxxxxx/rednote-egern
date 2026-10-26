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
