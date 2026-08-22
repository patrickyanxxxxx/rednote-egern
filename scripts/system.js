function isObject(value) {
  return value !== null && typeof value === "object";
}

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    const root = data?.data;
    if (!isObject(root)) return { body: data };

    for (const key of [
      "splash", "splash_config", "loading_img", "ads_groups", "advertisements",
      "ad_list", "marketing", "promotion", "cooperate_binds", "generic",
      "note_next_step", "widget_list"
    ]) {
      delete root[key];
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
