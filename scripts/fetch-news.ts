import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import dotenv from "dotenv";

import slugify from "@sindresorhus/slugify";
import { Translator } from "deepl-node";
import he from "he";
import matter from "gray-matter";
import Parser from "rss-parser";
import TurndownService from "turndown";

type CliOptions = {
  dryRun: boolean;
  limit: number;
  feeds: string[];
  targetLang: string;
};

const DEFAULT_FEEDS = [
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://cointelegraph.com/rss",
  "https://decrypt.co/feed",
];

const OUTPUT_ROOT = path.join(process.cwd(), "content", "news");

const parser = new Parser({ headers: { "User-Agent": "CryptoHubProBot/1.0 (+https://cryptohub.ro)" } });

const turndown = new TurndownService({ headingStyle: "atx" });
turndown.keep(["iframe", "figure"]);

const projectRoot = process.cwd();
dotenv.config({ path: path.join(projectRoot, ".env") });
dotenv.config({ path: path.join(projectRoot, ".env.local"), override: true });

const translatorKey = process.env.DEEPL_API_KEY;
const translator = translatorKey ? new Translator(translatorKey) : null;

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const opts: CliOptions = {
    dryRun: args.includes("--dry-run"),
    limit: Number(process.env.NEWS_MAX_ITEMS ?? 12),
    feeds: process.env.NEWS_FEEDS ? process.env.NEWS_FEEDS.split(",").map((s) => s.trim()).filter(Boolean) : DEFAULT_FEEDS,
    targetLang: process.env.NEWS_TARGET_LANG?.trim() || "ro",
  };

  for (const arg of args) {
    if (arg.startsWith("--limit=")) {
      const parsed = Number(arg.split("=")[1]);
      if (!Number.isNaN(parsed) && parsed > 0) opts.limit = parsed;
    }
    if (arg.startsWith("--feeds=")) {
      const list = arg.split("=")[1]?.split(",") ?? [];
      if (list.length) opts.feeds = list.map((s) => s.trim()).filter(Boolean);
    }
    if (arg.startsWith("--lang=")) {
      const lang = arg.split("=")[1];
      if (lang) opts.targetLang = lang;
    }
  }

  if (!opts.feeds.length) {
    throw new Error("No feeds configured. Set NEWS_FEEDS or --feeds.");
  }

  return opts;
}

const chunkText = (text: string, max = 4500) => {
  if (!text) return [] as string[];
  if (text.length <= max) return [text];
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const slice = text.slice(cursor, cursor + max);
    const lastBreak = slice.lastIndexOf("\n");
    if (lastBreak > max * 0.6) {
      chunks.push(slice.slice(0, lastBreak));
      cursor += lastBreak;
    } else {
      chunks.push(slice);
      cursor += slice.length;
    }
  }
  return chunks;
};

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!translator) return text;
  if (!text?.trim()) return text;

  const chunks = chunkText(text, 4500);
  const results: string[] = [];

  for (const chunk of chunks) {
    try {
      const res = await translator.translateText(chunk, null, targetLang, {
        formality: "default",
        preserveFormatting: true,
      });
      if (Array.isArray(res)) {
        results.push(...res.map((item) => item.text));
      } else {
        results.push(res.text);
      }
    } catch (error) {
      console.warn("Translation failed, using original text.", error);
      return text;
    }
  }

  return results.join("\n");
}

const cleanExcerpt = (text: string) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= 220) return normalized;
  const slice = normalized.slice(0, 220);
  return `${slice.replace(/[,;\s]+$/g, "")}...`;
};

const ensureDir = async (dir: string) => {
  await mkdir(dir, { recursive: true });
};

const loadExistingContent = async (filePath: string) => {
  try {
    return await readFile(filePath, "utf8");
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
};

async function processFeed(opts: CliOptions) {
  const seen = new Set<string>();
  let created = 0;

  for (const feedUrl of opts.feeds) {
    console.log(`Fetching: ${feedUrl}`);
    const feed = await parser.parseURL(feedUrl);

    for (const item of feed.items) {
      if (created >= opts.limit) {
        console.log("Reached limit, stopping.");
        return created;
      }

      const link = item.link ?? "";
      const sourceUrl = link ? new URL(link) : null;
      const sourceHost = sourceUrl?.hostname.replace(/^www\./, "") ?? feed.title ?? "unknown";

      const published = item.isoDate ? new Date(item.isoDate) : new Date();
      const dateStr = published.toISOString().split("T")[0];

      const baseSlug = slugify(item.title ?? `stire-${dateStr}`);
      const slug = `${dateStr}-${baseSlug}`;

      if (seen.has(slug)) continue;
      seen.add(slug);

      const year = String(published.getUTCFullYear());
      const month = String(published.getUTCMonth() + 1).padStart(2, "0");
      const destDir = path.join(OUTPUT_ROOT, year, month);
      const destFile = path.join(destDir, `${slug}.mdx`);

      const existing = await loadExistingContent(destFile);
      if (existing) {
        console.log(`Skipping existing article: ${slug}`);
        continue;
      }

      const rawHtml = (item as Record<string, unknown>)["content:encoded"] as string | undefined;
      const fallbackHtml = item.content as string | undefined;
      const html = rawHtml || fallbackHtml || "";

      const markdownSource = html ? turndown.turndown(html) : he.decode(item.contentSnippet ?? "");
      const decodedMarkdown = he.decode(markdownSource);
      const englishBody = decodedMarkdown.trim();

      const englishExcerpt = cleanExcerpt(
        he.decode(item.contentSnippet ?? item.summary ?? englishBody.split("\n")[0] ?? "")
      );

      const title = item.title?.trim() || "Stire crypto";
      const translatedTitle = await translateText(title, opts.targetLang);
      const translatedExcerpt = await translateText(englishExcerpt, opts.targetLang);
      const translatedBody = await translateText(englishBody, opts.targetLang);

      const rawTags = ((item as Parser.Item).categories ?? []) as unknown[];
      const tags = rawTags
        .map((tag) => {
          if (!tag) return "";
          if (typeof tag === "string") return tag.trim();
          if (typeof tag === "object" && tag !== null) {
            const candidate = (tag as Record<string, unknown>);
            const term = typeof candidate.term === "string" ? candidate.term : undefined;
            const underscore = typeof candidate._ === "string" ? candidate._ : undefined;
            if (term) return term.trim();
            if (underscore) return underscore.trim();
          }
          try {
            return String(tag).trim();
          } catch {
            return "";
          }
        })
        .filter((tag): tag is string => Boolean(tag))
        .slice(0, 6);

      const frontMatter = {
        title: translatedTitle,
        date: published.toISOString(),
        source: sourceHost,
        externalUrl: link || undefined,
        tags: tags.length ? tags : undefined,
        excerpt: translatedExcerpt,
      } as Record<string, unknown>;

      const fileContents = matter.stringify(translatedBody, frontMatter, {
        language: "yaml",
      });

      if (opts.dryRun) {
        console.log(`[dry-run] Would write ${destFile}`);
      } else {
        await ensureDir(destDir);
        await writeFile(destFile, fileContents, "utf8");
        console.log(`Saved ${destFile}`);
      }

      created += 1;
    }
  }

  return created;
}

async function main() {
  const opts = parseArgs();

  if (!translator) {
    console.warn("[avertisment] Nu este configurata nicio cheie DeepL (variabila DEEPL_API_KEY). Articolele vor ramane in limba originala.");
  }

  const count = await processFeed(opts);
  console.log(`${opts.dryRun ? "Ar fi fost" : "Au fost"} procesate ${count} articole.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


