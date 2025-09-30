import type { MetadataRoute } from "next";
import { getAllNews } from "@/lib/news";

const BASE_URL = "https://cryptohub.ro";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const newsItems = await getAllNews();
  const latestNewsDate = newsItems[0]?.date ? new Date(newsItems[0].date) : new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: latestNewsDate,
    },
    {
      url: `${BASE_URL}/stiri`,
      lastModified: latestNewsDate,
    },
    {
      url: `${BASE_URL}/burse`,
      lastModified: latestNewsDate,
    },
    {
      url: `${BASE_URL}/calculator`,
      lastModified: latestNewsDate,
    },
    {
      url: `${BASE_URL}/instrumente`,
      lastModified: latestNewsDate,
    },
  ];

  const newsRoutes: MetadataRoute.Sitemap = newsItems.map((item) => ({
    url: `${BASE_URL}/stiri/${item.slug}`,
    lastModified: item.date ? new Date(item.date) : latestNewsDate,
  }));

  return [...staticRoutes, ...newsRoutes];
}