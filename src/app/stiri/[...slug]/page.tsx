import { getNewsBySlug } from "@/lib/news";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function NewsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join("/");
  const item = await getNewsBySlug(slug);

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
      <article className="prose prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-neutral-200 leading-relaxed">
          {item.content}
        </div>
      </article>
    </main>
  );
}


