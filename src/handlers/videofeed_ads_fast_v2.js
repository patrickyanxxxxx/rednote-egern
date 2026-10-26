// @include lib/dom.js
// @include lib/ads-video.js
// @include lib/keys-feed.js
// @include lib/save.js

function cleanVideoItem(item) {
  if (!isObject(item)) return;
  enableSaving(item);
  for (const key of Object.keys(item)) {
    if (/^ip_location(?:_|$)/i.test(key)) continue;
    if (FEED_REMOVE_KEYS.has(key)) delete item[key];
  }
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    if (Array.isArray(data?.data)) {
      data.data = data.data.filter(item => !isVideoPromotion(item));
      for (const item of data.data) cleanVideoItem(item);
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
