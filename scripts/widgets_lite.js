const REMOVE_KEYS = new Set([
  "note_next_step", "widget_list", "widgets_nbb", "widgets_ncb", "widgets_ndb",
  "widgets", "widget", "hot_list", "hot_topics", "hot_queries", "hot_words",
  "activity", "activities", "activity_info", "activity_list", "poi", "poi_info",
  "poi_info_list", "location", "location_info", "place", "place_info",
  "related_search", "related_searches", "related_ques", "related_questions",
  "recommend_search", "search_recommend"
]);

const COMPONENT_TEXT = /(?:related|recommend|search|question|query|hot|trending|activity|campaign|poi|location|place|合集|相关|搜索|热点|热搜|活动|地点)/i;

function isObject(value) {
  return value !== null && typeof value === "object";
}

function isComponent(value) {
  if (!isObject(value) || Array.isArray(value)) return false;
  const fields = [
    value.type, value.model_type, value.card_type, value.item_type,
    value.widget_type, value.module_type, value.block_type, value.title,
    value.name, value.label, value.text, value.reason
  ];
  return fields.some(field => typeof field === "string" && COMPONENT_TEXT.test(field));
}

function clean(node, depth = 0) {
  if (!isObject(node) || depth > 4) return;
  if (Array.isArray(node)) {
    for (let i = node.length - 1; i >= 0; i--) {
      if (isComponent(node[i])) node.splice(i, 1);
      else clean(node[i], depth);
    }
    return;
  }
  for (const key of Object.keys(node)) {
    if (REMOVE_KEYS.has(key) || COMPONENT_TEXT.test(key)) {
      delete node[key];
    } else if (isObject(node[key])) {
      clean(node[key], depth + 1);
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
