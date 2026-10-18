import assert from 'node:assert/strict';
import feed from './scripts/feed_ads_lite_v2.js';
import video from './scripts/videofeed_ads_fast_v2.js';
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
    media_save_config: { disable_save: true, disable_watermark: false },
    function_switch: [{ type: 'video_download', enable: false, reason: '作者已关闭下载权限，无法保存' }],
    share_info: { function_entries: [{ type: 'copy_link' }] },
    video_info_v2: {
      media: {
        stream: {
          h264: [{ master_url: 'http://sns-v11.rednotecdn.com/main.mp4', backup_urls: [
            'http://sns-v8.rednotecdn.com/bad.mp4',
            'http://sns-v10.rednotecdn.com/good.mp4'
          ] }]
        }
      }
    }
  }, { id: 'ad', model_type: 'note', ads_info: {} }, { id: 'other', model_type: 'recommend_user' }]
});
if (videoOut.body.data.length !== 1 || videoOut.body.data[0].id !== 'ok') throw new Error('video');
const videoItem = videoOut.body.data[0];
const videoBackups = videoItem.video_info_v2.media.stream.h264[0].backup_urls;
if (videoBackups.includes('http://sns-v8.rednotecdn.com/bad.mp4') || !videoBackups.includes('http://sns-v10.rednotecdn.com/good.mp4')) throw new Error('v8 backup');
if (videoItem.related_searches || videoItem.music_info || videoItem.poi_info || videoItem.collection_info) throw new Error('video display fields');
if (videoItem.ip_location !== '广东') throw new Error('ip location removed');
if (videoItem.media_save_config.disable_save || !videoItem.media_save_config.disable_watermark) throw new Error('video watermark');
const downloadSwitch = videoItem.function_switch.find(item => item.type === 'video_download');
if (!downloadSwitch?.enable || downloadSwitch.reason) throw new Error('video download switch');
if (!videoItem.share_info.function_entries.some(item => item.type === 'video_download')) throw new Error('video download entry');
const searchOut = await run(search, 'https://search.rnote.com/api/sns/v4/search/trending?', {
  data: { queries: ['x'], hint_word: { text: 'x' } }
});
if (searchOut.body.data.queries.length || Object.keys(searchOut.body.data.hint_word).length) throw new Error('search');
const playback = {
  media: {
    stream: {
      h264: [{ audio_codec: 'aac', audio_bitrate: 64000, audio_duration: 12000, audio_channels: 2 }],
      h265: [{ audio_codec: 'aac', audio_bitrate: 96000, audio_duration: 12000, audio_channels: 2 }]
    }
  }
};
for (const key of ['video_info_v2', 'video_info']) {
  const item = { id: 'playback', model_type: 'note', music_info: { id: 1 }, [key]: playback };
  for (const data of [[item], { items: [item] }, { notes: [item] }, { cards: [item] }]) {
    const out = await run(feed, 'https://rec.rnote.com/api/sns/v6/homefeed?', { data });
    const kept = Array.isArray(out.body.data) ? out.body.data : Object.values(out.body.data)[0];
    assert.equal(kept.length, 1);
    assert.deepEqual(kept[0][key], playback, `${key} playback metadata changed`);
    assert.equal(kept[0].music_info, undefined);
  }
}
console.log('lite script tests OK');
