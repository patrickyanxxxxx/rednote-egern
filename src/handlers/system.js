// @include lib/dom.js

const SYSTEM_DROP_KEYS = [
  "splash", "splash_config", "loading_img", "ads_groups", "advertisements",
  "ad_list", "marketing", "promotion", "cooperate_binds", "generic",
  "note_next_step", "widget_list", "widgets_nbb", "widgets_ncb", "widgets_ndb"
];

export default async function(ctx) {
  try {
    const data = await ctx.response.json();
    const root = data?.data;
    if (!isObject(root)) return { body: data };

    for (const key of SYSTEM_DROP_KEYS) {
      delete root[key];
    }
    return { body: data };
  } catch (_) {
    return;
  }
}
