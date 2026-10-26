// 完整版笔记脚本沿用的保守清单
const FULL_NOTE_REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "related_query", "search_recommend", "search_recommendations",
  "recommend_search", "recommend_searches", "music", "music_info",
  "music_info_v2", "music_info_list", "note_music", "native_music",
  "native_music_info", "music_id", "music_name", "music_url", "music_track",
  "music_track_info"
]);

// 完整版信息流脚本沿用的保守清单
const FULL_FEED_REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "search_recommend", "recommend_search", "music",
  "music_info", "music_info_v2", "note_music", "native_music",
  "native_music_info", "music_track", "audio_info"
]);
