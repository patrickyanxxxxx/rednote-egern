// @include lib/dom.js
// @include lib/keys-note.js
// @include lib/save.js

function clean(node, depth) {
  if (!isObject(node) || depth > 5) return;
  if (Array.isArray(node)) {
    for (const item of node) clean(item, depth);
    return;
  }

  enableSaving(node);
  for (const key of Object.keys(node)) {
    if (NOTE_REMOVE_KEYS.has(key)) {
      delete node[key];
    } else if (isObject(node[key])) {
      clean(node[key], depth + 1);
    }
  }
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    clean(data, 0);
    return { body: data };
  } catch (_) {
    return;
  }
}
