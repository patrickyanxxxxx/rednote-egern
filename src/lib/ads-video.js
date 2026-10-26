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
