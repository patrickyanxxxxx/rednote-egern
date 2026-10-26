import { existsSync, readFileSync } from "node:fs";
import comment from "./scripts/comment_images_lite.js";

const run = (fn, url, body) => fn({
  request: { url },
  response: { json: async () => structuredClone(body) }
});

const samplePath = "testdata/comment_list_with_pictures.json";
if (!existsSync(samplePath)) {
  console.log("跳过评论图片测试：未提供 testdata/comment_list_with_pictures.json");
  process.exit(0);
}

const body = JSON.parse(readFileSync(samplePath, "utf8"));
const out = await run(comment, "https://edith.rnote.com/api/sns/v5/note/comment/list", body);
const pic = out.body.data.comments.find(item => Array.isArray(item.pictures) && item.pictures.length)?.pictures[0];
if (!pic) throw new Error("样本里没有 pictures");
if (pic.url.includes("?")) throw new Error("url 仍带处理参数: " + pic.url);
if (pic.origin_url.includes("?")) throw new Error("origin_url 仍带处理参数: " + pic.origin_url);
if (!pic.url.includes("/comment/")) throw new Error("url 不是评论图: " + pic.url);
if (pic.meme_package?.image_url?.includes("?")) throw new Error("meme image_url 仍带处理参数");
console.log("comment image rewrite tests OK");
console.log("url=", pic.url);
console.log("origin_url=", pic.origin_url);
