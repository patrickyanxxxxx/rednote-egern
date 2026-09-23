const REMOVE_BIZ_TYPES = new Set([
  "nbb_strategy_related_search",
  "nbb_related_hotspot",
  "note_activity_component",
  "ndb_poi",
  "poi",
  "ugc_buyable_poi",
  "ndb_sound",
  "ndb_music",
  "note_collection",
  "ndb_group_chat"
]);

const REMOVE_TEXT = ["猜你想搜", "加入粉丝群"];

const REMOVE_KEYS = new Set([
  "ads_goods_cards",
  "ads_comment_component",
  "ads_engage_bar",
  "pgy_comment_component",
  "pgy_engage_bar",
  "cooperate_engage_bar"
]);

function isObject(value) {
  return value !== null && typeof value === "object";
}

function hasRemoveText(value) {
  if (!isObject(value) || Array.isArray(value)) return false;
  const model = isObject(value.model) ? value.model : {};
  const fields = [
    value.title, value.name, value.text, value.label, value.sub_title,
    model.title, model.name, model.text, model.label, model.sub_title
  ];
  return fields.some(field =>
    typeof field === "string" && REMOVE_TEXT.some(text => field.includes(text))
  );
}

function isRemovable(value) {
  return isObject(value) &&
    (REMOVE_BIZ_TYPES.has(value.biz_type) || hasRemoveText(value));
}

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
    if (REMOVE_KEYS.has(key) || (key === "second_jump_bar" && value?.type === "ads")) {
      delete node[key];
    } else if (isRemovable(value)) {
      delete node[key];
    } else if (Array.isArray(value)) {
      node[key] = value.filter(item => !REMOVE_KEYS.has(item));
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
