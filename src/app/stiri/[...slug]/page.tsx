import type { Metadata } from "next";
import { getAllNews, getNewsBySlug } from "@/lib/news";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const SITE_URL = "https://cryptohub.ro";

export const revalidate = 60;

type PageParams = {
  slug: string[];
};

type PageProps = {
  params: Promise<PageParams>;
};

function createDescription(content: string): string {
  const stripped = content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return stripped.slice(0, 155);
}

function absoluteUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join("/");
  const item = await getNewsBySlug(slug);

  if (!item) {
    return {
      title: "Stire indisponibila",
      description: "Articolul cautat nu a fost gasit pe CryptoHub Pro.",
    };
  }

  const title = item.title || "Stire crypto";
  const description = createDescription(item.contentHtml || item.content);
  const canonical = `/stiri/${slug}`;
  const cover = absoluteUrl(item.cover);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: item.date,
      authors: item.source ? [item.source] : undefined,
      images: cover
        ? [
            {
              url: cover,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const news = await getAllNews();
  return news.map((item) => ({
    slug: item.slug.split("/"),
  }));
}

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

  const description = createDescription(item.contentHtml || item.content);
  const cover = absoluteUrl(item.cover);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description,
    datePublished: item.date,
    dateModified: item.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/stiri/${slug}`,
    },
    author: {
      "@type": "Organization",
      name: item.source || "CryptoHub Pro",
    },
    publisher: {
      "@type": "Organization",
      name: "CryptoHub Pro",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/fundal.jpg`,
      },
    },
    image: cover ? [cover] : undefined,
  };

  return (
    <main className="container-site py-12">
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-lg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {item.cover && (
          <div className="relative aspect-[16/9]">
            <Image
              src={item.cover}
              alt={item.title || ""}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 768px, 100vw"
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
            <div
              dangerouslySetInnerHTML={{
                __html: item.contentHtml || item.content,
              }}
            />
          </section>
        </div>
      </article>
    </main>
  );
}
