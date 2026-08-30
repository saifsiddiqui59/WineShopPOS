import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { marked } from "marked";

const source = resolve("docs/manual/WineShopPOS_User_Manual_Master_Reconsolidation.md");
const markdownTarget = resolve("public/manual/WineShopPOS_User_Manual.md");
const htmlTarget = resolve("public/manual/index.html");

await mkdir(dirname(markdownTarget), { recursive: true });
await copyFile(source, markdownTarget);

const markdown = await readFile(source, "utf8");
let html = await marked.parse(markdown, { gfm: true, breaks: false });

const seen = new Map();
const toc = [];

function textOnly(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function slugify(value) {
  const base = textOnly(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

  const count = seen.get(base) || 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level, body) => {
  const id = slugify(body);
  const title = textOnly(body);
  if (level === "2") toc.push({ id, title });
  return `<h${level} id="${id}">${body}</h${level}>`;
});

const tocHtml = toc.map(({ id, title }, index) => (
  `<a class="toc-link" href="#${id}">` +
  `<span>${String(index + 1).padStart(2, "0")}</span>` +
  `<strong>${title}</strong></a>`
)).join("");

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WineShopPOS User Manual</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #17181c;
      background: #f4f5f7;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; }
    .manual-shell { width: min(1200px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 64px; }
    .manual-header { margin-bottom: 20px; padding: 28px; border: 1px solid #e5e6e9; border-radius: 16px; background: #fff; }
    .manual-header p { margin: 7px 0 0; color: #73767d; }
    .manual-layout { display: grid; grid-template-columns: minmax(220px, 290px) minmax(0, 1fr); gap: 20px; align-items: start; }
    .toc { position: sticky; top: 20px; max-height: calc(100vh - 40px); overflow: auto; padding: 16px; border: 1px solid #e5e6e9; border-radius: 14px; background: #fff; }
    .toc h2 { margin: 0 0 12px; font-size: 15px; }
    .toc-links { display: grid; gap: 5px; }
    .toc-link { display: grid; grid-template-columns: 30px 1fr; gap: 8px; align-items: start; padding: 8px; border-radius: 8px; color: #3b3d43; text-decoration: none; font-size: 12px; }
    .toc-link:hover { background: #f7f1f4; }
    .toc-link span { color: #8e244d; font-weight: 800; }
    .content { min-width: 0; padding: 30px; border: 1px solid #e5e6e9; border-radius: 14px; background: #fff; line-height: 1.65; }
    .content h1 { margin-top: 0; font-size: 28px; }
    .content h2 { scroll-margin-top: 24px; margin-top: 38px; padding-top: 8px; border-top: 1px solid #eeeef0; font-size: 21px; }
    .content h3 { scroll-margin-top: 24px; margin-top: 25px; font-size: 16px; }
    .content p, .content li { font-size: 14px; }
    .content blockquote { margin: 16px 0; padding: 12px 16px; border-left: 4px solid #8e244d; background: #faf6f8; color: #55575c; }
    .content code { padding: 2px 5px; border-radius: 4px; background: #f4f4f5; }
    .content pre { overflow: auto; padding: 14px; border-radius: 10px; background: #202124; color: #fff; }
    .content pre code { padding: 0; background: transparent; }
    .content table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .content th, .content td { padding: 9px; border: 1px solid #e5e6e9; text-align: left; vertical-align: top; }
    @media (max-width: 860px) {
      .manual-layout { grid-template-columns: 1fr; }
      .toc { position: static; max-height: none; }
      .content, .manual-header { padding: 20px; }
    }
  </style>
</head>
<body>
  <main class="manual-shell">
    <header class="manual-header">
      <h1>WineShopPOS User Manual</h1>
      <p>Operational guidance for authorized WineShopPOS users.</p>
    </header>
    <div class="manual-layout">
      <aside class="toc" aria-label="Manual contents">
        <h2>Contents</h2>
        <div class="toc-links">${tocHtml}</div>
      </aside>
      <article class="content">${html}</article>
    </div>
  </main>
</body>
</html>`;

await writeFile(htmlTarget, page, "utf8");

console.log(`Synced User Manual markdown -> ${markdownTarget}`);
console.log(`Generated clickable User Manual -> ${htmlTarget}`);
