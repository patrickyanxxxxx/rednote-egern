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
  const recentChats = /\/api\/sns\/v1\/im\/get_recent_chats(?:\?|$)/.test(url);
  const messageDetect = /\/api\/sns\/v\d+\/message\/detect(?:\?|$)/.test(url);
  if (!recentChats && !messageDetect) return;

  try {
    const data = await ctx.response.json();
    if (recentChats) {
      const list = data?.data?.recent_chat_user;
      if (Array.isArray(list)) {
        data.data.recent_chat_user = list.filter(item => {
          // source=algo is the message-page “可能认识的人” recommendation list.
          return !(isObject(item) && item.source === "algo");
        });
      }
    }
    if (messageDetect && isObject(data?.data)) {
      clearPromotion(data.data.subNotificationCommercial);
      clearPromotion(data.data.subNotificationEvent);
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
