function isObject(value) {
  return value !== null && typeof value === "object";
}

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
    return { body: data };
  } catch (_) {
    return;
  }
}
