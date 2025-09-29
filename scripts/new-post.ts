// scripts/new-post.ts
import fs from "fs";
import path from "path";
import readline from "readline";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/(^-|-$)/g, "");
}
function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}
function ask(q: string) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<string>((resolve) => rl.question(q, (a) => { rl.close(); resolve(a.trim()); }));
}
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

(async () => {
  // citim din CLI flags sau punem întrebări
  const args = Object.fromEntries(process.argv.slice(2).map(a => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=")];
  }));

  const title = args.title || await ask("Titlu: ");
  const date  = args.date  || await ask(`Data (YYYY-MM-DD, default ${todayISO()}): `) || todayISO();
  const source = args.source || await ask("Sursă (nume sau domeniu): ");
  const externalUrl = args.url || await ask("Link (extern) sau gol: ");
  const cover = args.cover || await ask("Cover image (URL) sau gol: ");
  const tags = (args.tags || await ask("Taguri (ex: btc,market) sau gol: ")).split(",").map(t => t.trim()).filter(Boolean);
  const summary = args.summary || await ask("Rezumat (scurt) sau gol: ");

  if (!title) {
    console.error("Titlul este obligatoriu.");
    process.exit(1);
  }

  // locul unde salvăm
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dir = path.join(process.cwd(), "content", "news", String(yyyy), String(mm));
  ensureDir(dir);

  const slug = slugify(title).slice(0, 100) || `stire-${yyyy}${mm}`;
  const file = path.join(dir, `${slug}.mdx`);

  if (fs.existsSync(file)) {
    console.error("Există deja un fișier cu acest titlu (slug). Schimbă titlul sau setează --title diferit.");
    process.exit(1);
  }

  const fm = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
${source ? `source: "${source.replace(/"/g, '\\"')}"` : ""}
${externalUrl ? `externalUrl: "${externalUrl.replace(/"/g, '\\"')}"` : ""}
${cover ? `cover: "${cover.replace(/"/g, '\\"')}"` : ""}
${tags.length ? `tags:\n${tags.map(t => `  - ${t}`).join("\n")}` : `tags: []`}
---
`;

  const body = `${fm}
${summary}

{/* Scrie conținut MDX aici dacă vrei */}
`;

  fs.writeFileSync(file, body, "utf8");
  console.log("Creat:", path.relative(process.cwd(), file));
})();
