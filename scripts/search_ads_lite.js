function isObject(value) {
  return value !== null && typeof value === "object";
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    if (/\/search\/banner_list(?:\?|$)/.test(ctx.request?.url || "")) {
      if (data?.data !== undefined) data.data = {};
    } else if (/\/search\/(?:hot_list|trending)(?:\?|$)/.test(ctx.request?.url || "")) {
      if (Array.isArray(data?.data?.items)) data.data.items = [];
      if (isObject(data?.data)) {
        data.data.queries = [];
        data.data.hint_word = {};
      }
    } else if (/\/search\/hint(?:\?|$)/.test(ctx.request?.url || "") && isObject(data?.data)) {
      data.data.hint_words = [];
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
