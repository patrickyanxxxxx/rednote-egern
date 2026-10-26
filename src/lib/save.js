function enableSaving(node) {
  if (isObject(node.media_save_config)) {
    node.media_save_config.disable_save = false;
    node.media_save_config.disable_watermark = true;
    node.media_save_config.disable_weibo_cover = true;
  }

  if (Array.isArray(node.function_switch)) {
    for (const entry of node.function_switch) {
      if (entry?.type === "image_download" || entry?.type === "video_download") {
        entry.enable = true;
        delete entry.reason;
      }
    }
  }

  if (isObject(node.share_info)) {
    if (!Array.isArray(node.share_info.function_entries)) {
      node.share_info.function_entries = [];
    }
    if (!node.share_info.function_entries.some(entry => entry?.type === "video_download")) {
      node.share_info.function_entries.unshift({ type: "video_download" });
    }
  }
}
