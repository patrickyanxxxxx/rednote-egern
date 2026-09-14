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

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    if (Array.isArray(data?.data)) data.data = data.data.filter(item => !isPromotion(item));
    return { body: data };
  } catch (_) {
    return;
  }
}
