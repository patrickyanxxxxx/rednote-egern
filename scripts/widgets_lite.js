const REMOVE_KEYS = new Set([
  "note_next_step", "widget_list", "widgets_nbb", "widgets_ncb", "widgets_ndb",
  "widgets", "widget", "hot_list", "hot_topics", "activity", "activities",
  "poi", "poi_info", "location", "location_info", "place", "place_info"
]);

function isObject(value) {
  return value !== null && typeof value === "object";
}

function cleanRoot(root) {
  if (!isObject(root)) return;
  for (const key of REMOVE_KEYS) delete root[key];
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    cleanRoot(data?.data);
    return { body: data };
  } catch (_) {
    return;
  }
}
