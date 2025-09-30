import { NextRequest, NextResponse } from "next/server";

const GH_OWNER  = process.env.GITHUB_OWNER!;
const GH_REPO   = process.env.GITHUB_REPO!;
const GH_TOKEN  = process.env.GITHUB_TOKEN!;
const GH_BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.HOME_FILE || "src/data/home.json";
const API_KEY   = process.env.NEWS_API_KEY || "";

const GH_API = "https://api.github.com";

type HomeData = {
  headline?: string;
  subheadline?: string;
  heroImage?: string;
  ctaText?: string;
  ctaUrl?: string;
  highlights?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get("x-api-key");
    if (!API_KEY || key !== API_KEY) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    if (!GH_OWNER || !GH_REPO || !GH_TOKEN)
      return NextResponse.json({ error: "GitHub env missing" }, { status: 500 });

    const patch = (await req.json()) as HomeData;

    // read file (if exists)
    const getRes = await fetch(
      `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURIComponent(FILE_PATH)}?ref=${encodeURIComponent(GH_BRANCH)}`,
      { headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" }, cache: "no-store" }
    );

    let sha: string | undefined;
    let current: HomeData = {};
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
      const content = Buffer.from(data.content, "base64").toString("utf8");
      try { current = JSON.parse(content); } catch { current = {}; }
    } else if (getRes.status !== 404) {
      return NextResponse.json({ error: "read failed" }, { status: 502 });
    }

    const merged = { ...current, ...patch };

    // put back
    const putRes = await fetch(
      `${GH_API}/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURIComponent(FILE_PATH)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `chore(home): update`,
          content: Buffer.from(JSON.stringify(merged, null, 2), "utf8").toString("base64"),
          branch: GH_BRANCH,
          sha,
        }),
      }
    );
    if (!putRes.ok) {
      const err = await putRes.text();
      return NextResponse.json({ error: "commit failed", detail: err }, { status: 502 });
    }

    return NextResponse.json({ ok: true, path: FILE_PATH });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}
