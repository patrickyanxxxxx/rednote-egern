// 信息流与视频流共用：展示类扩展字段
const FEED_REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "related_query", "search_recommend", "recommend_search",
  "music", "music_info", "music_info_v2", "note_music", "native_music",
  "native_music_info", "music_track", "audio_info", "poi", "poi_info",
  "poi_info_list", "location", "location_info", "place", "place_info",
  "address_info", "geo_info", "collection", "collection_info",
  "note_collection", "note_collection_info", "collect_info", "series",
  "series_info", "album", "album_info"
]);

const DISPLAY_KEY = /(?:related|recommend).*(?:search|question|query)|(?:search|question|query).*(?:related|recommend)|(?:^|_)(?:music|audio|poi|location|place|address|geo|collection|collect|series|album)(?:_|$)/i;

// 媒体描述字段不能当音乐/音频组件删掉，否则播放器拿不到编码参数
const MEDIA_FIELD = /^(?:audio|video)_(?:codec|bitrate|duration|channels|sample_rate|profile|fps|frame_rate|width|height)$/i;

function shouldRemoveDisplayKey(key) {
  if (MEDIA_FIELD.test(key)) return false;
  return !/^ip_location(?:_|$)/i.test(key) && DISPLAY_KEY.test(key);
}
