import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export interface NewsItem {
  _id: string;
  title: string;
  date: string;
  cover?: string;
  source?: string;
  externalUrl?: string;
  tags?: string[];
  slug: string;
  excerpt?: string;
  content: string;
  contentHtml: string;
  _raw: {
    flattenedPath: string;
  };
}

const newsDir = path.join(process.cwd(), "content", "news");

function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  return remark().use(remarkHtml).processSync(markdown).toString().trim();
}

async function readNewsFromDisk(): Promise<NewsItem[]> {
  if (!fs.existsSync(newsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(newsDir, { recursive: true })
    .filter((file: unknown) => typeof file === "string" && file.endsWith(".mdx"))
    .map((file: unknown) => path.join(newsDir, file as string));

  const newsItems = files.map((filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);

    const relativePath = path.relative(newsDir, filePath);
    const slug = relativePath.replace(/\.mdx$/, "").replace(/\\/g, "/");

    const contentHtml = markdownToHtml(content);

    return {
      _id: slug,
      title: data.title || "",
      date: data.date || "",
      cover: data.cover,
      source: data.source,
      externalUrl: data.externalUrl,
      tags: data.tags || [],
      slug,
      excerpt: data.excerpt || "",
      content,
      contentHtml,
      _raw: {
        flattenedPath: `news/${slug}`,
      },
    };
  });

  return newsItems.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

const getAllNewsCached = unstable_cache(
  readNewsFromDisk,
  ["news-items"],
  {
    tags: ["news"],
    revalidate: 60,
  }
);

export async function getAllNews(): Promise<NewsItem[]> {
  return getAllNewsCached();
}

export const getNewsBySlug = cache(async (slug: string): Promise<NewsItem | null> => {
  const newsItems = await getAllNews();
  return newsItems.find((item) => item.slug === slug) || null;
});
