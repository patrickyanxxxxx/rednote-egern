function isObject(value) {
  return value !== null && typeof value === "object";
}

export default async function(ctx) {
  const url = ctx.request?.url || "";
  try {
    const data = await ctx.response.json();
    if (/\/search\/banner_list(?:\?|$)/.test(url)) {
      if (data?.data !== undefined) data.data = {};
    } else if (/\/search\/hot_list(?:\?|$)/.test(url)) {
      if (Array.isArray(data?.data?.items)) data.data.items = [];
    } else if (/\/search\/hint(?:\?|$)/.test(url)) {
      if (isObject(data?.data)) data.data.hint_words = [];
    } else if (/\/search\/trending(?:\?|$)/.test(url)) {
      if (isObject(data?.data)) {
        data.data.queries = [];
        data.data.hint_word = {};
      }
    } else if (/\/search\/notes(?:\?|$)/.test(url)) {
      if (Array.isArray(data?.data?.items)) {
        data.data.items = data.data.items.filter(item => {
          const model = String(item?.model_type || "").toLowerCase();
          return !model || model === "note" || model === "video";
        });
      }
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
