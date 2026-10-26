// @include lib/dom.js
// @include lib/ads.js
// @include lib/keys-feed.js
// @include lib/save.js

function cleanItem(node, depth = 0) {
  if (!isObject(node) || depth > 4) return;
  if (Array.isArray(node)) {
    for (const item of node) cleanItem(item, depth);
    return;
  }
  enableSaving(node);
  for (const key of Object.keys(node)) {
    if (FEED_REMOVE_KEYS.has(key) || shouldRemoveDisplayKey(key)) {
      delete node[key];
    } else if (isObject(node[key])) {
      cleanItem(node[key], depth + 1);
    }
  }
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
