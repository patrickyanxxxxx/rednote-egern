import video from './scripts/videofeed_ads_fast_v2.js';
import note from './scripts/note_display_lite_v2.js';

const run = (fn, url, body) => fn({
  request: { url },
  response: { json: async () => structuredClone(body) }
});

const feed = (await import('./scripts/feed_ads_lite_v2.js')).default;

const feedOut = await run(feed, 'https://rec.rnote.com/api/sns/v6/homefeed?', {
  data: [{
    id: 'home',
    model_type: 'note',
    ip_location: '广东',
    media_save_config: {
      disable_save: true,
      disable_watermark: false,
      disable_weibo_cover: false
    },
    function_switch: [
      { type: 'image_download', enable: false, reason: '作者已关闭下载权限，无法保存' }
    ],
    share_info: { function_entries: [{ type: 'copy_link' }] }
  }]
});

const homeItem = feedOut.body.data[0];
if (homeItem.media_save_config.disable_save) throw new Error('home save');
if (!homeItem.media_save_config.disable_watermark) throw new Error('home watermark');
if (homeItem.ip_location !== '广东') throw new Error('home ip location');
const homeSwitch = homeItem.function_switch.find(item => item.type === 'image_download');
if (!homeSwitch?.enable || homeSwitch.reason) throw new Error('home switch');
if (homeItem.share_info.function_entries[0]?.type !== 'video_download') throw new Error('home entry');

const videoOut = await run(video, 'https://rec.rnote.com/api/sns/v4/note/videofeed?', {
  data: [{
    id: 'video',
    model_type: 'note',
    ip_location: '广东',
    media_save_config: {
      disable_save: true,
      disable_watermark: false,
      disable_weibo_cover: false
    },
    function_switch: [
      { type: 'video_download', enable: false, reason: '作者已关闭下载权限，无法保存' }
    ],
    share_info: { function_entries: [{ type: 'copy_link' }] }
  }]
});

const videoItem = videoOut.body.data[0];
if (videoItem.media_save_config.disable_save) throw new Error('video save');
if (!videoItem.media_save_config.disable_watermark) throw new Error('video watermark');
if (!videoItem.media_save_config.disable_weibo_cover) throw new Error('video cover');
if (videoItem.ip_location !== '广东') throw new Error('video ip location');
const videoSwitch = videoItem.function_switch.find(item => item.type === 'video_download');
if (!videoSwitch?.enable || videoSwitch.reason) throw new Error('video switch');
if (videoItem.share_info.function_entries[0]?.type !== 'video_download') throw new Error('video entry');

const imageOut = await run(note, 'https://edith.rnote.com/api/sns/v2/note/imagefeed?', {
  data: [{
    note_list: [{
      id: 'image',
      model_type: 'note',
      media_save_config: {
        disable_save: true,
        disable_watermark: false,
        disable_weibo_cover: false
      },
      function_switch: [
        { type: 'image_download', enable: false, reason: '作者已关闭下载权限，无法保存' }
      ],
      share_info: { function_entries: [{ type: 'copy_link' }] }
    }]
  }]
});

const imageItem = imageOut.body.data[0].note_list[0];
if (imageItem.media_save_config.disable_save) throw new Error('image save');
if (!imageItem.media_save_config.disable_watermark) throw new Error('image watermark');
if (!imageItem.media_save_config.disable_weibo_cover) throw new Error('image cover');
const imageSwitch = imageItem.function_switch.find(item => item.type === 'image_download');
if (!imageSwitch?.enable || imageSwitch.reason) throw new Error('image switch');
if (imageItem.share_info.function_entries[0]?.type !== 'video_download') throw new Error('image entry');

console.log('watermark v2 tests OK');
