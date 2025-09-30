// src/app/api/news/create/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// forțează runtime Node (nu Edge), că folosim fs
export const runtime = "nodejs";

type Payload = {
  title: string;
  date: string; // "YYYY-MM-DD"
  link?: string;
  source?: string; // nume domeniu / publicație
  cover?: string;  // URL imagine sau /images/.. din public; evită data:uri
  tags?: string;   // "btc, market"
  excerpt?: string;
  content?: string; // MDX
};

// slug simplu din titlu
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 100);
}

function ymd(d: string) {
  // așteptăm "YYYY-MM-DD"
  const [y, m, day] = d.split("-");
  return { yyyy: y, mm: m, dd: day, iso: `${y}-${m}-${day}` };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    if (!body.title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!body.date) {
      return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    // (opțional) cheie simplă
    // const apiKey = req.headers.get("x-api-key");
    // if (apiKey !== process.env.NEWS_API_KEY) {
    //   return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    // }

    const t = slugify(body.title);
    const { yyyy, mm, iso } = ymd(body.date);

    // directoare
    const dir = path.join(process.cwd(), "content", "news", yyyy, mm);
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `${t}.mdx`);

    // tags în array
    const tags = (body.tags || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // front-matter + conținut
    const mdx = `---
title: "${body.title.replace(/"/g, '\\"')}"
date: "${iso}"
source: "${(body.source || "").replace(/"/g, '\\"')}"
externalUrl: "${(body.link || "").replace(/"/g, '\\"')}"
cover: "${(body.cover || "").replace(/"/g, '\\"')}"
tags: ${JSON.stringify(tags)}
---

${body.excerpt || ""}

${body.content || ""}
`;

    await fs.writeFile(filePath, mdx, "utf8");

    return NextResponse.json({ success: true, file: filePath });
  } catch (e: unknown) {
    console.error("API ERROR:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "unknown error" }, { status: 500 });
  }
}

