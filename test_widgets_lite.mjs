import widgets from './scripts/widgets_lite_v2.js';

const out = await widgets({
  request: { url: 'https://edith.rnote.com/api/sns/v8/note/widgets?' },
  response: { json: async () => structuredClone({
    data: {
      widgets_nbb: { biz_type: 'nbb_strategy_related_search', model: { title: '相关搜索' } },
      widgets_ndb: { biz_type: 'ndb_sound', model: { title: '原声' } },
      widget_list: [
        { biz_type: 'poi', model: { title: '地点' } },
        { biz_type: 'note_activity_component', model: { title: '活动' } },
        { biz_type: 'note_collection', model: { title: '合集' } },
        { biz_type: 'ndb_group_chat', model: { title: '加入粉丝群' } },
        { biz_type: 'normal_component', model: { title: '普通组件' } }
      ],
      generic: { pin_search_highlights: { name: '猜你想搜' }, keep: true },
      nested: {
        items: [
          { biz_type: 'nbb_related_hotspot', model: { title: '热点' } },
          { biz_type: 'ugc_buyable_poi', model: { title: '地点' } },
          { biz_type: 'normal_component', model: { title: '普通组件' } }
        ]
      },
      keep: true
    }
  }) }
});
const data = out.body.data;
if ('widgets_nbb' in data || 'widgets_ndb' in data) throw new Error('root widgets');
if (!Array.isArray(data.widget_list) || data.widget_list.length !== 1 ||
    data.widget_list[0].biz_type !== 'normal_component') throw new Error('widget list');
if (data.generic?.pin_search_highlights || !data.generic?.keep) throw new Error('generic');
if (data.nested.items.length !== 1 || data.nested.items[0].biz_type !== 'normal_component') throw new Error('nested widgets');
if (!data.keep) throw new Error('keep');
console.log('widgets lite tests OK');
