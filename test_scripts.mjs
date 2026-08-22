import feed from './scripts/feed_ads.js';
import search from './scripts/search.js';
import system from './scripts/system.js';
import note from './scripts/note.js';

const run = (fn, url, body) => fn({ request: { url }, response: { json: async () => structuredClone(body) } });

const feedOut = await run(feed, 'https://rec.rnote.com/api/sns/v6/homefeed?', {
  data: [
    { id: 1, ads_info: {} },
    { id: 2, related_searches: ['x'], music_info: { id: 1 } },
    { id: 3, is_ads: true }
  ]
});
if (feedOut.body.data.length !== 1 || feedOut.body.data[0].id !== 2 || feedOut.body.data[0].related_searches || feedOut.body.data[0].music_info) throw new Error('feed');

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

console.log('all script tests OK');
