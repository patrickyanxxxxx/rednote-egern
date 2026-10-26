// @include lib/dom.js
// @include lib/ads.js
// @include lib/keys-full.js

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
