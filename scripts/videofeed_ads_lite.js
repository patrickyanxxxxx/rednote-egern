const REMOVE_KEY = /(?:related[_-]?(?:ques|question|search|query)|music|(?:^|_)(?:poi|location|place|address|geo)(?:_|$)|collection|series|album)/i;

function shouldRemoveDisplayKey(key) {
  return !/^ip_location(?:_|$)/i.test(key) && REMOVE_KEY.test(key);
}

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
}

function cleanDisplay(node, depth) {
  if (!isObject(node) || depth > 4) return;
  if (Array.isArray(node)) {
    for (const item of node) cleanDisplay(item, depth);
    return;
  }
  enableSaving(node);
  for (const key of Object.keys(node)) {
    if (shouldRemoveDisplayKey(key)) {
      delete node[key];
    } else if (isObject(node[key])) {
      cleanDisplay(node[key], depth + 1);
    }
  }
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    if (Array.isArray(data?.data)) data.data = data.data.filter(item => !isPromotion(item));
    cleanDisplay(data, 0);
    return { body: data };
  } catch (_) {
    return;
  }
}
