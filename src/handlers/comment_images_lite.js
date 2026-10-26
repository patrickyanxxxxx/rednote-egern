// @include lib/dom.js
// @include lib/log.js
// @include lib/comment-images.js

export default async function(ctx) {
  const url = ctx.request?.url || "";
  try {
    const data = await ctx.response.json();
    const changed = rewriteCommentPictures(data);
    logLite("评论图片去水印", (url.split("?")[0] || url) + " rewritten=" + changed);
    return { body: data };
  } catch (_) {
    return;
  }
}
