// 本文件由 build.mjs 从 src/ 生成，请勿直接编辑。

function isObject(value) {
  return value !== null && typeof value === "object";
}

function marked(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key);
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
      // 真实响应里热榜内容在 data.data，比旧代码假设的多一层
      for (const node of [data?.data, data?.data?.data]) {
        if (isObject(node)) {
          node.queries = [];
          node.hint_word = {};
        }
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
