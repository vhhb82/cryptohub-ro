import fs from "fs";
import path from "path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const API_URL = "https://cryptopanic.com/api/v1/posts/";

type CryptoPanicCurrency = {
  code: string;
};

type CryptoPanicPost = {
  title: string;
  published_at: string;
  source?: { title?: string };
  url: string;
  domain?: string;
  currencies?: CryptoPanicCurrency[];
};

type CryptoPanicResponse = {
  results: CryptoPanicPost[];
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function fetchCryptoPanic() {
  const token = process.env.CRYPTOPANIC_TOKEN;
  if (!token) throw new Error("Missing CRYPTOPANIC_TOKEN in .env.local");

  const res = await fetch(`${API_URL}?auth_token=${token}&public=true`);
  if (!res.ok) {
    throw new Error(`Upstream error ${res.status}: ${await res.text()}`);
  }

  const data: CryptoPanicResponse = await res.json();

  const folder = path.join(process.cwd(), "content/news/2025/09");
  fs.mkdirSync(folder, { recursive: true });

  for (const post of data.results) {
    const slug = slugify(post.title);

    const filePath = path.join(folder, `${slug}.mdx`);
    const tags = JSON.stringify(post.currencies?.map((currency) => currency.code) ?? []);
    const mdx = `---\ntitle: "${post.title}"\ndate: "${post.published_at}"\nsource: "${post.source?.title || "CryptoPanic"}"\nexternalUrl: "${post.url}"\ntags: ${tags}\n---\n\n${post.domain || ""}\n`;

    fs.writeFileSync(filePath, mdx);
    console.log("Created:", filePath);
  }
}

fetchCryptoPanic().catch((error) => {
  console.error(error);
  process.exit(1);
});
