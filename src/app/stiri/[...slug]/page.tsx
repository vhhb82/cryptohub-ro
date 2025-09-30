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
    <main className="container-site py-12">
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-lg">
        {item.cover && (
          <div className="relative aspect-[16/9]">
            <Image
              src={item.cover}
              alt={item.title || ""}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="space-y-8 p-8 sm:p-10">
          <header className="space-y-4">
            <p className="text-sm font-medium text-neutral-500">
              {dateStr}
              {item.source ? ` - ${item.source}` : ""}
              {item.externalUrl && (
                <>
                  {" - "}
                  <a
                    className="underline hover:text-neutral-700"
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Extern
                  </a>
                </>
              )}
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              {item.title}
            </h1>

            {!!item.tags?.length && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/stiri?tag=${encodeURIComponent(t)}`}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 hover:border-neutral-300"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}
          </header>

          <section className="prose max-w-none text-neutral-800">
            <div className="whitespace-pre-wrap leading-relaxed">
              {item.content}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}