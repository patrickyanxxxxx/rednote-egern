// @include lib/dom.js

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    const url = ctx.request?.url || "";
    if (/\/search\/notes(?:\?|$)/.test(url) && Array.isArray(data?.data?.items)) {
      data.data.items = data.data.items.filter(item => item?.model_type !== "ads");
    } else if (/\/search\/banner_list(?:\?|$)/.test(url)) {
      if (data?.data !== undefined) data.data = {};
    } else if (/\/search\/(?:hot_list|trending)(?:\?|$)/.test(url)) {
      if (Array.isArray(data?.data?.items)) data.data.items = [];
      // 真实响应里热榜内容在 data.data，比旧代码假设的多一层
      for (const node of [data?.data, data?.data?.data]) {
        if (isObject(node)) {
          node.queries = [];
          node.hint_word = {};
        }
      }
    } else if (/\/search\/hint(?:\?|$)/.test(url) && isObject(data?.data)) {
      data.data.hint_words = [];
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
