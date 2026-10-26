// 把 src/handlers/*.js 里的 // @include lib/x.js 展开成自包含脚本。
// Egern 按 script_url 单文件加载，没有 import，所以只能生成而不是抽库。
// 用法: node build.mjs   → 覆盖 scripts/*.js
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const HANDLERS = join(root, "src", "handlers");
const LIB = join(root, "src", "lib");
const OUT = join(root, "scripts");

const HEADER = "// 本文件由 build.mjs 从 src/ 生成，请勿直接编辑。\n\n";

const libCache = new Map();
async function lib(name) {
  if (!libCache.has(name)) {
    libCache.set(name, (await readFile(join(LIB, name.replace(/^lib\//, "")), "utf8")).trimEnd());
  }
  return libCache.get(name);
}

async function build(src) {
  const seen = new Set();
  const out = [];
  for (const line of src.split("\n")) {
    const hit = line.match(/^\/\/ @include (\S+)$/);
    if (!hit) {
      out.push(line);
      continue;
    }
    if (seen.has(hit[1])) continue;
    seen.add(hit[1]);
    out.push(await lib(hit[1]), "");
  }
  const text = out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
  return { text: `${HEADER}${text}\n`, includes: [...seen] };
}

const files = (await readdir(HANDLERS)).filter(f => f.endsWith(".js")).sort();
for (const file of files) {
  const { text, includes } = await build(await readFile(join(HANDLERS, file), "utf8"));
  await writeFile(join(OUT, file), text);
  console.log(`${file.padEnd(32)} <- ${includes.join(", ") || "(无共享块)"}`);
}
console.log(`\n生成 ${files.length} 个脚本到 scripts/`);

// ---- 模块 YAML：展开 # @include <fragment> ----
const MODULES = join(root, "src", "modules");
const moduleOutputs = {
  "lite.yaml": "RedNote_Remove_Ads_Lite.yaml",
  "full.yaml": "RedNote_Remove_Ads.yaml",
};

for (const [src, dest] of Object.entries(moduleOutputs)) {
  const lines = (await readFile(join(MODULES, src), "utf8")).split("\n");
  const out = [];
  const used = [];
  for (const line of lines) {
    const hit = line.match(/^\s*# @include (\S+)$/);
    if (!hit) {
      out.push(line);
      continue;
    }
    const frag = (await readFile(join(MODULES, hit[1]), "utf8")).trimEnd();
    used.push(hit[1]);
    out.push(frag);
  }
  const text = out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  await writeFile(join(root, dest), text);
  console.log(`${dest.padEnd(32)} <- ${used.join(", ")}`);
}
