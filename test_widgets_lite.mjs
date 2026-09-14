import widgets from './scripts/widgets_lite.js';

const out = await widgets({
  request: { url: 'https://edith.rnote.com/api/sns/v8/note/widgets?' },
  response: { json: async () => structuredClone({
    data: {
      widgets_nbb: [{ type: 'related_search' }],
      widgets_ncb: [{ type: 'hot_topic' }],
      widgets_ndb: [{ type: 'activity' }],
      widget_list: [{ type: 'location' }],
      note_next_step: { type: 'place' },
      nested: {
        items: [
          { title: '相关搜索', type: 'module' },
          { title: '热点', type: 'module' },
          { title: '活动', type: 'module' },
          { title: '地点', type: 'module' },
          { title: '普通组件', type: 'module' }
        ]
      },
      keep: true
    }
  }) }
});
const data = out.body.data;
for (const key of ['widgets_nbb', 'widgets_ncb', 'widgets_ndb', 'widget_list', 'note_next_step']) {
  if (key in data) throw new Error(key);
}
if (!data.keep) throw new Error('keep');
console.log('widgets lite tests OK');
