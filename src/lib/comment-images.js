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
