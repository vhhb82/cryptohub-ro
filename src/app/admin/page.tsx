"use client";

import { useEffect, useMemo, useState } from "react";

type NewsPayload = {
  title: string;
  date: string;
  link?: string;
  source?: string;
  cover?: string;
  tags: string;
  excerpt?: string;
  content?: string;
};

const fieldLabelClass = "block text-sm font-medium text-neutral-200 mb-1";
const inputClass =
  "w-full rounded-md bg-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-teal-400/40";

export default function AdminPage() {
  const [apiKey, setApiKey] = useState<string>("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [source, setSource] = useState("");
  const [cover, setCover] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("NEWS_API_KEY") || "";
    setApiKey(saved);
  }, []);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("NEWS_API_KEY", apiKey);
    } else {
      localStorage.removeItem("NEWS_API_KEY");
    }
  }, [apiKey]);

  const tagPills = useMemo(
    () =>
      tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsText]
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);

    try {
      const payload: NewsPayload = {
        title,
        date,
        link: link || undefined,
        source: source || undefined,
        cover: cover || undefined,
        tags: tagsText,
        excerpt: excerpt || undefined,
        content: content || undefined,
      };

      const response = await fetch("/api/news/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setOk("Știrea a fost publicată.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Eroare necunoscută");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container-site space-y-6 pb-12 pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">Admin - publică știri</h1>
        <p className="text-sm text-neutral-400">
          Endpoint intern pentru a publica rapid știri MDX cu metadate completate corect. Zona este exclusă din indexare
          prin robots.txt.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <label className={fieldLabelClass} htmlFor="apiKey">
            API Key (salvată local în browser)
          </label>
          <input
            id="apiKey"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            className={inputClass}
            placeholder="NEWS_API_KEY"
          />
          <p className="text-xs text-neutral-400">
            Cheia se trimite în header <code className="text-neutral-200">x-api-key</code> către ruta API dedicată.
          </p>
        </div>
      </section>

      {error && <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
      {ok && <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{ok}</div>}

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-4">
            <div>
              <label className={fieldLabelClass} htmlFor="title">
                Titlu
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={fieldLabelClass} htmlFor="date">
                  Data
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={fieldLabelClass} htmlFor="source">
                  Sursă (opțional)
                </label>
                <input
                  id="source"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className={inputClass}
                  placeholder="cointelegraph.com"
                />
              </div>
            </div>

            <div>
              <label className={fieldLabelClass} htmlFor="link">
                Link extern (opțional)
              </label>
              <input
                id="link"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                className={inputClass}
                placeholder="https://exemplu.com/articol"
              />
            </div>

            <div>
              <label className={fieldLabelClass} htmlFor="cover">
                Cover (URL https sau /images/…)
              </label>
              <input
                id="cover"
                value={cover}
                onChange={(event) => setCover(event.target.value)}
                className={inputClass}
                placeholder="https://example.com/cover.jpg"
              />
              <p className="text-xs text-neutral-400">
                Evită <code className="text-neutral-200">data:image/…</code>. Pentru surse externe asigură-te că domeniul este permis în
                <code className="text-neutral-200"> next.config.ts → images.remotePatterns</code>.
              </p>
            </div>

            <div>
              <label className={fieldLabelClass} htmlFor="tags">
                Taguri (separate prin virgulă)
              </label>
              <input
                id="tags"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                className={inputClass}
                placeholder="btc, defi, market"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {tagPills.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-neutral-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-4">
            <div>
              <label className={fieldLabelClass} htmlFor="excerpt">
                Rezumat (excerpt)
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                className={`${inputClass} min-h-[80px]`}
                placeholder="Fraza scurtă pentru listări și meta description override."
              />
            </div>

            <div>
              <label className={fieldLabelClass} htmlFor="content">
                Conținut (MDX)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className={`${inputClass} min-h-[200px] font-mono`}
                placeholder="<!-- markdown / mdx -->"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {busy ? "Public…" : "Publică știrea"}
        </button>
      </form>
    </main>
  );
}
