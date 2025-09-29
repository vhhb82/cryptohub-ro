import fs from "fs";
import path from "path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const API_URL = "https://cryptopanic.com/api/v1/posts/";

async function fetchCryptoPanic() {
  const token = process.env.CRYPTOPANIC_TOKEN;
  if (!token) throw new Error("Missing CRYPTOPANIC_TOKEN in .env.local");

  const res = await fetch(`${API_URL}?auth_token=${token}&public=true`);
  if (!res.ok) {
    throw new Error(`Upstream error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();

  // Salvează știri în folderul content/news
  const folder = path.join(process.cwd(), "content/news/2025/09");
  fs.mkdirSync(folder, { recursive: true });

  for (const [i, post] of data.results.entries()) {
    const slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const filePath = path.join(folder, `${slug}.mdx`);
    const mdx = `---
title: "${post.title}"
date: "${post.published_at}"
source: "${post.source?.title || "CryptoPanic"}"
externalUrl: "${post.url}"
tags: ${JSON.stringify(post.currencies?.map((c: any) => c.code) || [])}
---

${post.domain || ""}
`;

    fs.writeFileSync(filePath, mdx);
    console.log("✅ Creat:", filePath);
  }
}

fetchCryptoPanic().catch(console.error);

