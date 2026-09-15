import feed from './scripts/feed_ads_lite.js';
import video from './scripts/videofeed_ads_fast.js';
import search from './scripts/search_ads_lite.js';
const run = (fn, url, body) => fn({ request: { url }, response: { json: async () => structuredClone(body) } });
const feedOut = await run(feed, 'https://rec.rnote.com/api/sns/v6/homefeed?', {
  data: [
    { id: 1, ads_info: {} }, { id: 2, title: 'normal' },
    { id: 3, model_type: 'live_v2' }, { id: 4, card_icon: 'shop' },
    { id: 5, note_attributes: ['goods'] }, { id: 6, model_type: 'note', music_info: { id: 1 } }
  ]
});
if (feedOut.body.data.length !== 2 || feedOut.body.data[0].id !== 2 || feedOut.body.data[1].id !== 6) throw new Error('feed');
if (feedOut.body.data[1].music_info) throw new Error('feed cleanup');
const videoOut = await run(video, 'https://rec.rnote.com/api/sns/v8/note/videofeed?', {
  data: [{
    id: 'ok', model_type: 'note', ip_location: '广东', related_searches: ['x'],
    music_info: { id: 1 }, poi_info: { name: 'place' },
    collection_info: { name: 'collection' },
    media_save_config: { disable_save: true, disable_watermark: false }
  }, { id: 'ad', model_type: 'note', ads_info: {} }, { id: 'other', model_type: 'recommend_user' }]
});
if (videoOut.body.data.length !== 1 || videoOut.body.data[0].id !== 'ok') throw new Error('video');
const videoItem = videoOut.body.data[0];
if (videoItem.related_searches || videoItem.music_info || videoItem.poi_info || videoItem.collection_info) throw new Error('video display fields');
if (videoItem.ip_location !== '广东') throw new Error('ip location removed');
if (videoItem.media_save_config.disable_save || !videoItem.media_save_config.disable_watermark) throw new Error('video watermark');
const searchOut = await run(search, 'https://search.rnote.com/api/sns/v4/search/trending?', {
  data: { queries: ['x'], hint_word: { text: 'x' } }
});
if (searchOut.body.data.queries.length || Object.keys(searchOut.body.data.hint_word).length) throw new Error('search');
console.log('lite script tests OK');
