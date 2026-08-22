import feed from './scripts/feed_ads.js';
import search from './scripts/search.js';
import system from './scripts/system.js';
import note from './scripts/note.js';

const run = (fn, url, body) => fn({ request: { url }, response: { json: async () => structuredClone(body) } });

const feedOut = await run(feed, 'https://rec.rnote.com/api/sns/v6/homefeed?', {
  data: [
    { id: 1, ads_info: {} },
    { id: 2, related_searches: ['x'], music_info: { id: 1 } },
    { id: 3, is_ads: true },
    { id: 4, model_type: 'live_v2' },
    { id: 5, card_icon: 'shop' },
    { id: 6, note_attributes: ['goods'] },
    { id: 7, has_related_goods: true },
    { id: 8, note_attributes: ['普通标签'] }
  ]
});
if (feedOut.body.data.length !== 2 || !feedOut.body.data.some(item => item.id === 2) || !feedOut.body.data.some(item => item.id === 8)) throw new Error('feed');
if (feedOut.body.data.some(item => [1, 3, 4, 5, 6, 7].includes(item.id))) throw new Error('homefeed promotions');

const searchOut = await run(search, 'https://edith.rnote.com/api/sns/v4/search/trending?', {
  data: { queries: ['x'], hint_word: { text: 'x' } }
});
if (searchOut.body.data.queries.length || Object.keys(searchOut.body.data.hint_word).length) throw new Error('search');

const systemOut = await run(system, 'https://edith.rnote.com/api/sns/v2/system_service/splash_config', {
  data: { ads_groups: [1], keep: true }
});
if (systemOut.body.data.ads_groups || !systemOut.body.data.keep) throw new Error('system');

const noteOut = await run(note, 'https://edith.rnote.com/api/sns/v2/note/feed?', {
  data: [{ music_info: { id: 1 }, media_save_config: { disable_save: true, disable_watermark: false } }]
});
const item = noteOut.body.data[0];
if (item.music_info || item.media_save_config.disable_save || !item.media_save_config.disable_watermark) throw new Error('note');

const commentOut = await run(note, 'https://edith.rnote.com/api/sns/v5/note/comment/list?', {
  data: { comments: [{ audio_info: { audio_url: 'https://example.test/voice.m4a' }, music_info: { id: 1 } }] }
});
const comment = commentOut.body.data.comments[0];
if (!comment.audio_info || comment.music_info) throw new Error('comment audio');

const videoFeedOut = await run(note, 'https://rec.rnote.com/api/sns/v4/note/videofeed?', {
  data: [
    { id: 'normal', model_type: 'note', related_ques: ['店铺'], music_info: { id: 1 } },
    { id: 'live', model_type: 'live_v2' },
    { id: 'ad', model_type: 'note', ad: { sponsor: true } },
    { id: 'sponsored', model_type: 'note', ads_info: { label: 'Sponsored' } },
    { id: 'shop', model_type: 'note', has_related_goods: true },
    { id: 'other', model_type: 'recommend_user' }
  ]
});
if (videoFeedOut.body.data.length !== 1 || videoFeedOut.body.data[0].id !== 'normal') throw new Error('videofeed filtering');
if (videoFeedOut.body.data[0].related_ques || videoFeedOut.body.data[0].music_info) throw new Error('videofeed cleanup');

const widgetOut = await run(system, 'https://edith.rnote.com/api/sns/v2/note/widgets', {
  data: { widgets_nbb: [1], widgets_ncb: [1], widgets_ndb: [1], keep: true }
});
if (widgetOut.body.data.widgets_nbb || widgetOut.body.data.widgets_ncb || widgetOut.body.data.widgets_ndb || !widgetOut.body.data.keep) throw new Error('widgets');

console.log('all script tests OK');
