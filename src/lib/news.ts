import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface NewsItem {
  _id: string;
  title: string;
  date: string;
  cover?: string;
  source?: string;
  externalUrl?: string;
  tags?: string[];
  slug: string;
  content: string;
  _raw: {
    flattenedPath: string;
  };
}

export async function getAllNews(): Promise<NewsItem[]> {
  const newsDir = path.join(process.cwd(), 'content/news');
  
  if (!fs.existsSync(newsDir)) {
    return [];
  }

  const files = fs.readdirSync(newsDir, { recursive: true })
    .filter((file: unknown) => typeof file === 'string' && file.endsWith('.mdx'))
    .map((file: unknown) => path.join(newsDir, file as string));

  const newsItems = files.map((filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    const relativePath = path.relative(newsDir, filePath);
    const slug = relativePath.replace(/\.mdx$/, '').replace(/\\/g, '/');
    
    return {
      _id: slug,
      title: data.title || '',
      date: data.date || '',
      cover: data.cover,
      source: data.source,
      externalUrl: data.externalUrl,
      tags: data.tags || [],
      slug,
      content,
      _raw: {
        flattenedPath: `news/${slug}`,
      },
    };
  });

  return newsItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const newsItems = await getAllNews();
  return newsItems.find(item => item.slug === slug) || null;
}
