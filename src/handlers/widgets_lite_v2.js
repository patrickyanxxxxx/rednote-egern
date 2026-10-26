// @include lib/dom.js
// @include lib/widgets.js

function clean(node, depth = 0) {
  if (!isObject(node) || depth > 6) return;
  if (Array.isArray(node)) {
    for (let i = node.length - 1; i >= 0; i--) {
      if (isRemovable(node[i])) node.splice(i, 1);
      else clean(node[i], depth + 1);
    }
    return;
  }

  if (isObject(node.generic)) delete node.generic.pin_search_highlights;
  delete node.pin_search_highlights;

  for (const key of Object.keys(node)) {
    const value = node[key];
    if (WIDGET_REMOVE_KEYS.has(key) || (key === "second_jump_bar" && value?.type === "ads")) {
      delete node[key];
    } else if (isRemovable(value)) {
      delete node[key];
    } else if (Array.isArray(value)) {
      node[key] = value.filter(item => !WIDGET_REMOVE_KEYS.has(item));
      clean(node[key], depth + 1);
    } else if (isObject(value)) {
      clean(value, depth + 1);
    }
  }
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    clean(data);
    return { body: data };
  } catch (_) {
    return;
  }
}
