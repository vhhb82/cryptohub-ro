// scripts/import-rss.ts
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import fs from "fs";
import path from "path";
import Parser from "rss-parser";

// ---------- tipuri ----------
type Item = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  enclosure?: { url?: string };
  [key: string]: any;
};

// ---------- setări ----------
const DEFAULT_FEEDS = [
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://cointelegraph.com/rss",
  "https://decrypt.co/feed",
  "https://news.bitcoin.com/feed/",
  "https://finbold.com/feed/",
];

// CLI: --limit=20 --query=btc --feeds=url1,url2
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=")];
  })
);
const LIMIT = Math.max(1, Math.min(50, Number(args.limit ?? 20)));
const FEEDS = (args.feeds ? String(args.feeds).split(",") : DEFAULT_FEEDS).map((s) => s.trim());
const QUERY = (args.query ?? "").toLowerCase().trim();

// ---------- helpers sync ----------
function slugify(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/(^-|-$)/g, "");
}
function toISO(date?: string) {
  const d = date ? new Date(date) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}
function inferTags(title: string) {
  const t = title.toLowerCase();
  const set = new Set<string>();
  const map: Record<string, string[]> = {
    btc: ["btc", "bitcoin"],
    eth: ["eth", "ethereum"],
    sol: ["sol", "solana"],
    xrp: ["xrp", "ripple"],
    ada: ["ada", "cardano"],
    etf: ["etf"],
    defi: ["defi"],
    nft: ["nft"],
  };
  for (const [tag, keys] of Object.entries(map)) {
    if (keys.some((k) => t.includes(k))) set.add(tag);
  }
  return Array.from(set);
}

// ---------- imagine din RSS/OG ----------
function readMedia(obj: any): string | undefined {
  const media =
    obj?.["media:content"]?.["$"]?.url ||
    obj?.["media:content"]?.url;
  const thumb =
    obj?.["media:thumbnail"]?.["$"]?.url ||
    obj?.["media:thumbnail"]?.url;
  return media || thumb;
}
async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (NewsBot; +https://example.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const html = await res.text();
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    return m?.[1];
  } catch {
    return undefined;
  }
}

// ---------- parser RSS (fără await la top) ----------
const parser = new Parser({
  requestOptions: {
    headers: {
      "User-Agent": "Mozilla/5.0 (NewsBot; +https://example.com)",
      Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    },
  },
});

// ---------- import feed ----------
async function importFeed(url: string) {
  const feed = await parser.parseURL(url);
  const source = feed.title || new URL(url).hostname;
  const items = (feed.items ?? []).slice(0, LIMIT) as Item[];

  let created = 0;

  for (const it of items) {
    const title = it.title?.trim();
    const link = it.link?.trim();
    if (!title || !link) continue;
    if (QUERY && !title.toLowerCase().includes(QUERY)) continue;

    const iso = toISO(it.isoDate ?? it.pubDate);
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    const slug = (slugify(title).slice(0, 100) || `stire-${yyyy}${mm}${dd}`);
    const dir = path.join(process.cwd(), "content", "news", String(yyyy), String(mm));
    ensureDir(dir);

    const file = path.join(dir, `${slug}.mdx`);
    if (fs.existsSync(file)) continue;

    // COVER: enclosure -> media:* -> OG image
    let cover =
      it?.enclosure?.url ||
      readMedia(it);
    if (!cover) {
      cover = await fetchOgImage(link);
    }

    const tags = inferTags(title);
    const fm = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${yyyy}-${mm}-${dd}
source: "${String(source).replace(/"/g, '\\"')}"
externalUrl: "${link}"
${cover ? `cover: "${cover.replace(/"/g, '\\"')}"` : ""}
${tags.length ? `tags:\n${tags.map((t) => `  - ${t}`).join("\n")}` : `tags: []`}
---
`;

    const body = `${fm}
${(it.contentSnippet || "").slice(0, 280)}
`;
    fs.writeFileSync(file, body, "utf8");
    console.log("Created:", path.relative(process.cwd(), file));
    created++;
  }

  return created;
}

// ---------- main (fără top-level await) ----------
async function main() {
  let total = 0;
  for (const f of FEEDS) {
    try {
      total += await importFeed(f);
    } catch (e: any) {
      console.warn("Feed failed:", f, "-", e?.message || e);
    }
  }
  console.log(`Done. ${total} articole noi.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
