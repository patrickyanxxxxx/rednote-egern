// 本文件由 build.mjs 从 src/ 生成，请勿直接编辑。

function isObject(value) {
  return value !== null && typeof value === "object";
}

function marked(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key);
}

function logLite(name, detail) {
  try {
    console.log("[RedNote Lite] " + name + " " + detail);
  } catch (_) {}
}

function stripCommentImageUrl(url) {
  if (typeof url !== "string") return url;
  if (url.indexOf("/comment/") === -1) return url;
  const q = url.indexOf("?");
  return q === -1 ? url : url.slice(0, q);
}

function rewriteCommentPictures(node, depth = 0) {
  if (!isObject(node) || depth > 6) return 0;
  let changed = 0;
  if (Array.isArray(node)) {
    for (const item of node) changed += rewriteCommentPictures(item, depth);
    return changed;
  }

  if (Array.isArray(node.pictures)) {
    for (const pic of node.pictures) {
      if (!isObject(pic)) continue;
      const nextUrl = stripCommentImageUrl(pic.url);
      if (nextUrl !== pic.url) {
        pic.url = nextUrl;
        changed += 1;
      }
      const nextOrigin = stripCommentImageUrl(pic.origin_url);
      if (nextOrigin !== pic.origin_url) {
        pic.origin_url = nextOrigin;
        changed += 1;
      }
      if (isObject(pic.meme_package)) {
        const nextMeme = stripCommentImageUrl(pic.meme_package.image_url);
        if (nextMeme !== pic.meme_package.image_url) {
          pic.meme_package.image_url = nextMeme;
          changed += 1;
        }
      }
    }
  }

  for (const value of Object.values(node)) {
    if (isObject(value)) changed += rewriteCommentPictures(value, depth + 1);
  }
  return changed;
}

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
