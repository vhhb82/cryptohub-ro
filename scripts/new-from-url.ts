// scripts/new-from-url.ts
import fs from "fs";
import path from "path";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/(^-|-$)/g, "");
}
function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}
function pickMeta(html: string, key: "og:title" | "og:image" | "og:site_name" | "article:published_time" | "description" | "twitter:image") {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, "i");
  return html.match(re)?.[1];
}
function guessDate(s?: string) {
  if (!s) return new Date();
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

(async () => {
  const args = Object.fromEntries(process.argv.slice(2).map(a => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=")];
  }));
  const url = args.url || args.u;
  if (!url) {
    console.error("Folosire: npm run new:url -- --url=https://articol");
    process.exit(1);
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (NewsBot; +https://example.com)",
      "Accept": "text/html,application/xhtml+xml",
    },
  });
  const html = await res.text();

  const title = pickMeta(html, "og:title") || (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "Știre");
  const cover = pickMeta(html, "og:image") || pickMeta(html, "twitter:image");
  const source = pickMeta(html, "og:site_name") || new URL(url).hostname;
  const published = pickMeta(html, "article:published_time");
  const description = pickMeta(html, "description") || "";

  const d = guessDate(published);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const date = `${yyyy}-${mm}-${dd}`;

  const dir = path.join(process.cwd(), "content", "news", String(yyyy), String(mm));
  ensureDir(dir);

  const slug = slugify(title).slice(0, 100) || `stire-${yyyy}${mm}${dd}`;
  const file = path.join(dir, `${slug}.mdx`);
  if (fs.existsSync(file)) {
    console.error("Fișier existent. Modifică titlul sau salvează manual.");
    process.exit(1);
  }

  const fm = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
source: "${source.replace(/"/g, '\\"')}"
externalUrl: "${url.replace(/"/g, '\\"')}"
${cover ? `cover: "${cover.replace(/"/g, '\\"')}"` : ""}
tags: []
---
`;

  const body = `${fm}
${description}

{/* Poți completa conținut MDX suplimentar aici */}
`;

  fs.writeFileSync(file, body, "utf8");
  console.log("Creat:", path.relative(process.cwd(), file));
})();
