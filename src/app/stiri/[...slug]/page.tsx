import { allNews, type News } from "contentlayer/generated";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// Dacă ai componenta MDX pe care ți-am dat-o anterior, păstrează importul de mai jos.
// Dacă nu o ai încă, poți șterge importul și fallback-ul de mai jos va afișa text simplu.
import Mdx from "@/components/Mdx";

type PageProps = {
  params: { slug: string[] };
};

function findArticle(slugParts: string[]): News | undefined {
  const joined = slugParts.join("/"); // ex: "2025/09/test"

  // 1) potrivire după computed slug (fără "news/")
  const item =
    allNews.find((n) => n.slug === joined || n.slugAsParams === joined) ??
    // 2) în caz că unele item-uri au doar flattenedPath, îl normalizăm:
    allNews.find(
      (n) => n._raw.flattenedPath.replace(/^news\//, "") === joined
    );

  return item;
}

export default function NewsPage({ params }: PageProps) {
  const item = findArticle(params.slug);

  if (!item) return notFound();

  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  return (
    <main className="container-site pt-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
          {item.title}
        </h1>

        <p className="text-sm text-neutral-400">
          {dateStr}
          {item.source ? ` · ${item.source}` : ""}
          {item.externalUrl && (
            <>
              {" "}
              ·{" "}
              <a
                className="underline"
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Extern ↗
              </a>
            </>
          )}
        </p>

        {!!item.tags?.length && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {item.tags.map((t) => (
              <Link
                key={t}
                href={`/stiri?tag=${encodeURIComponent(t)}`}
                className="text-xs rounded-full px-2 py-0.5 bg-white/10 border border-white/15 hover:bg-white/15 transition"
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </header>

      {item.cover && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10">
          <Image
            src={item.cover}
            alt={item.title || ""}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Conținutul articolului */}
      {item.body?.code ? (
        // Dacă ai componenta <Mdx /> (client) din răspunsurile anterioare, asta va reda MDX-ul corect.
        <article className="prose prose-invert max-w-none">
          <Mdx code={item.body.code} />
        </article>
      ) : item.body?.raw ? (
        // Fallback simplu dacă nu există body.code
        <article className="whitespace-pre-wrap text-neutral-200 leading-relaxed">
          {item.body.raw}
        </article>
      ) : (
        <p className="text-neutral-400">Acest articol nu are conținut.</p>
      )}
    </main>
  );
}


