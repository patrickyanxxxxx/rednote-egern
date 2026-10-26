// 笔记详情：比信息流多一批字段，不能与上面合并
const NOTE_REMOVE_KEYS = new Set([
  "related_ques", "related_questions", "related_search", "related_searches",
  "related_queries", "related_query", "search_recommend", "search_recommendations",
  "recommend_search", "recommend_searches", "music", "music_info",
  "music_info_v2", "music_info_list", "note_music", "native_music",
  "native_music_info", "music_id", "music_name", "music_url", "music_track",
  "music_track_info", "poi_info", "poi_info_list", "location_info", "location",
  "place_info", "place", "address_info", "poi", "coordinates", "geo_info",
  "collection_info", "note_collection", "note_collection_info", "collection",
  "series_info", "series", "album_info", "album"
]);
