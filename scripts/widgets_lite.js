const REMOVE_BIZ_TYPES = new Set([
  "nbb_strategy_related_search",
  "nbb_related_hotspot",
  "note_activity_component",
  "ndb_poi",
  "poi",
  "ugc_buyable_poi",
  "ndb_sound",
  "ndb_music",
  "note_collection"
]);

function isObject(value) {
  return value !== null && typeof value === "object";
}

function isRemovable(value) {
  return isObject(value) && REMOVE_BIZ_TYPES.has(value.biz_type);
}

function clean(node, depth = 0) {
  if (!isObject(node) || depth > 5) return;
  if (Array.isArray(node)) {
    for (let i = node.length - 1; i >= 0; i--) {
      if (isRemovable(node[i])) node.splice(i, 1);
      else clean(node[i], depth);
    }
    return;
  }

  if (isObject(node.generic)) delete node.generic.pin_search_highlights;

  for (const key of Object.keys(node)) {
    const value = node[key];
    if (key === "generic" && isObject(value)) {
      delete value.pin_search_highlights;
    } else if (key === "widget_list" && Array.isArray(value)) {
      node[key] = value.filter(item => !isRemovable(item));
      clean(node[key], depth + 1);
    } else if ((key === "widgets_nbb" || key === "widgets_ncb" || key === "widgets_ndb") && isRemovable(value)) {
      delete node[key];
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
