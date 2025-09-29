"use client";

import { useEffect, useMemo, useState } from "react";

type NewsPayload = {
  title: string;
  date: string;          // YYYY-MM-DD
  link?: string;
  source?: string;
  cover?: string;        // URL https sau /images/.. (evită data:uri)
  tags: string;          // <<< string cu virgule
  excerpt?: string;
  content?: string;      // MDX
};

export default function AdminPage() {
  const [apiKey, setApiKey] = useState<string>("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [source, setSource] = useState("");
  const [cover, setCover] = useState("");
  const [tagsText, setTagsText] = useState("");      // <<< string
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // persistăm cheia în browser
  useEffect(() => {
    const saved = localStorage.getItem("NEWS_API_KEY") || "";
    setApiKey(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("NEWS_API_KEY", apiKey || "");
  }, [apiKey]);

  // doar pentru preview-ul de “pastile”
  const tagPills = useMemo(
    () =>
      tagsText
        .split(",")
        .map(t => t.trim())
        .filter(Boolean),
    [tagsText]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const payload: NewsPayload = {
        title,
        date,          // ex: "2025-09-29"
        link: link || undefined,
        source: source || undefined,
        cover: cover || undefined,
        tags: tagsText,                    // <<< trimitem string
        excerpt: excerpt || undefined,
        content: content || undefined,
      };

      const res = await fetch("/api/news/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Request failed");

      setOk("Știrea a fost publicată.");
      // opțional: reset
      // setTitle(""); setDate(""); setLink(""); setSource(""); setCover("");
      // setTagsText(""); setExcerpt(""); setContent("");
    } catch (err: any) {
      setError(err?.message || "Eroare necunoscută");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-site pt-8 space-y-6">
      <div className="space-y-2">
        <label className="text-sm text-neutral-300">API Key (salvată la tine în browser)</label>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full rounded-md bg-white/10 px-3 py-2 outline-none"
          placeholder="NEWS_API_KEY"
        />
        <p className="text-xs text-neutral-400">
          Cheia se trimite în header <code>x-api-key</code> către ruta API.
        </p>
      </div>

      {error && <div className="text-red-400">❌ {error}</div>}
      {ok && <div className="text-emerald-400">✅ {ok}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Titlu</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-md bg-white/10 px-3 py-2" required />
        </div>

        <div>
          <label className="block mb-1">Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-md bg-white/10 px-3 py-2" required />
        </div>

        <div>
          <label className="block mb-1">Link extern (opțional)</label>
          <input value={link} onChange={e => setLink(e.target.value)} className="w-full rounded-md bg-white/10 px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1">Sursă (nume/domeniu – opțional)</label>
          <input value={source} onChange={e => setSource(e.target.value)} className="w-full rounded-md bg-white/10 px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1">Cover (URL https sau /images/..)</label>
          <input
            value={cover}
            onChange={e => setCover(e.target.value)}
            className="w-full rounded-md bg-white/10 px-3 py-2"
            placeholder="https://example.com/cover.jpg sau /images/cover.jpg"
          />
          <p className="text-xs text-neutral-400 mt-1">
            Evită <code>data:image/..;base64</code>. Pentru imagini externe, asigură-te că domeniul e în <code>next.config.ts → images.remotePatterns</code>.
          </p>
        </div>

        <div>
          <label className="block mb-1">Taguri (separate prin virgulă)</label>
          <input
            value={tagsText}
            onChange={e => setTagsText(e.target.value)}
            className="w-full rounded-md bg-white/10 px-3 py-2"
            placeholder="btc, market"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tagPills.map(t => (
              <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-white/10">{t}</span>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1">Rezumat (excerpt)</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full min-h-[80px] rounded-md bg-white/10 px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1">Conținut (MDX – opțional)</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full min-h-[180px] rounded-md bg-white/10 px-3 py-2" />
        </div>

        <button
          disabled={busy}
          className="rounded-md bg-emerald-600/80 hover:bg-emerald-600 px-4 py-2 disabled:opacity-60"
        >
          {busy ? "Public..." : "Publică știrea"}
        </button>
      </form>
    </div>
  );
}

