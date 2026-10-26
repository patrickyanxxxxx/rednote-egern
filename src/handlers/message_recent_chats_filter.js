// @include lib/dom.js
// @include lib/log.js

function clearPromotion(section) {
  if (!isObject(section)) return;
  section.count = 0;
  section.count_type = 0;
  section.latest = { title: "", time: -1 };
}

export default async function(ctx) {
  const url = ctx.request?.url || "";
  if (!/\/api\/sns\/v\d+\/message\/detect(?:\?|$)/.test(url)) return;

  try {
    const data = await ctx.response.json();
    if (isObject(data?.data)) {
      clearPromotion(data.data.subNotificationCommercial);
      clearPromotion(data.data.subNotificationEvent);
    }
    logLite("消息页推广净化", url.split("?")[0] || url);
    return { body: data };
  } catch (_) {
    return;
  }
}
