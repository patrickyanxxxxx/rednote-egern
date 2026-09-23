function isObject(value) {
  return value !== null && typeof value === "object";
}

export default async function(ctx) {
  const url = ctx.request?.url || "";
  if (!/\/api\/sns\/v1\/im\/get_recent_chats(?:\?|$)/.test(url)) return;

  try {
    const data = await ctx.response.json();
    const list = data?.data?.recent_chat_user;
    if (Array.isArray(list)) {
      data.data.recent_chat_user = list.filter(item => {
        // source=algo is the message-page “可能认识的人” recommendation list.
        return !(isObject(item) && item.source === "algo");
      });
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
