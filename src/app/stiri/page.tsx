import type { Metadata } from "next";
import Link from "next/link";
import { getAllNews } from "@/lib/news";
import NewsCard from "@/components/news/NewsCard";
import TagFilter from "./TagFilter";

export const revalidate = 60;

const DEFAULT_PER_PAGE = 12;
const MAX_PER_PAGE = 50;
const siteUrl = "https://cryptohub.ro";

type StiriSearchParams = {
  tag?: string | string[];
  page?: string | string[];
  perPage?: string | string[];
};

type NormalizedParams = {
  tag: string | null;
  page: number;
  perPage: number;
};

function toScalar(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeParams(params?: StiriSearchParams): NormalizedParams {
  const tag = toScalar(params?.tag)?.trim() || null;
  const parsedPage = Number(toScalar(params?.page) ?? 1);
  const parsedPerPage = Number(toScalar(params?.perPage) ?? DEFAULT_PER_PAGE);

  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const perPageCandidate = Number.isFinite(parsedPerPage) && parsedPerPage > 0 ? Math.floor(parsedPerPage) : DEFAULT_PER_PAGE;
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, perPageCandidate));

  return { tag, page, perPage };
}

function buildCanonicalPath({ tag, page, perPage }: NormalizedParams): string {
  const search = new URLSearchParams();
  if (tag) search.set("tag", tag);
  if (page > 1) search.set("page", String(page));
  if (perPage !== DEFAULT_PER_PAGE) search.set("perPage", String(perPage));

  const query = search.toString();
  return `/stiri${query ? `?${query}` : ""}`;
}

function formatTag(tag: string): string {
  return tag
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function resolveSearchParams(searchParams?: Promise<StiriSearchParams>): Promise<NormalizedParams> {
  const raw = searchParams ? await searchParams : undefined;
  return normalizeParams(raw);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<StiriSearchParams>;
}): Promise<Metadata> {
  const normalized = await resolveSearchParams(searchParams);
  const canonical = buildCanonicalPath(normalized);
  const baseTitle = "Știri crypto";
  const formattedTag = normalized.tag ? formatTag(normalized.tag) : null;
  const title = formattedTag ? `${baseTitle} · ${formattedTag}` : `${baseTitle} actualizate pentru investitori`;

  const description = formattedTag
    ? `Ultimele știri și analize despre ${formattedTag} pe piața crypto, actualizate la zi pe CryptoHub Pro.`
    : "Cele mai recente știri crypto, filtrate și organizate pentru investitorii din România. Află rapid informațiile care contează.";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${canonical}`,
      type: "website",
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function StiriPage({
  searchParams,
}: {
  searchParams?: Promise<StiriSearchParams>;
}) {
  const normalized = await resolveSearchParams(searchParams);
  const { tag, perPage } = normalized;
  const canonical = buildCanonicalPath(normalized);

  const allNews = await getAllNews();
  const sorted = [...allNews].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const filtered = tag ? sorted.filter((n) => n.tags?.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) : sorted;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(normalized.page, totalPages);
  const start = (current - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  const allTags = Array.from(
    new Set(
      allNews
        .flatMap((item) => item.tags || [])
        .filter(Boolean)
        .map((t) => t.trim())
    )
  ).sort((a, b) => a.localeCompare(b, "ro"));

  const baseQuery = new URLSearchParams();
  if (perPage !== DEFAULT_PER_PAGE) {
    baseQuery.set("perPage", String(perPage));
  }

  const paginationParams = new URLSearchParams(baseQuery.toString());
  if (tag) paginationParams.set("tag", tag);

  const itemListJsonLd = pageItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: pageItems.map((item, index) => ({
          "@type": "ListItem",
          position: start + index + 1,
          url: `${siteUrl}/stiri/${item.slug}`,
          name: item.title,
        })),
      }
    : null;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: tag ? `Știri crypto despre ${formatTag(tag)}` : "Știri crypto pentru investitori",
    description: tag
      ? `Selecție de știri despre ${formatTag(tag)} și impactul lor asupra pieței crypto.`
      : "Flux de știri crypto verificat, actualizat frecvent pentru piața din România.",
    url: `${siteUrl}${canonical}`,
  };

  return (
    <main className="container-site space-y-6 pb-12 pt-8">
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {tag ? `Știri crypto: ${formatTag(tag)}` : "Știri crypto"}
          </h1>
          <p className="text-sm text-neutral-300">
            Află rapid cele mai noi noutăți din blockchain, token-uri și piața cripto, actualizate constant.
          </p>
        </div>
        <TagFilter allTags={allTags} currentTag={tag} baseQuery={baseQuery.toString()} />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {pageItems.map((item) => (
          <NewsCard key={item._id} item={item} />
        ))}
        {!pageItems.length && (
          <p className="col-span-full rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-neutral-300">
            Nu am găsit articole pentru acest filtru. Încearcă o altă etichetă sau revino mai târziu.
          </p>
        )}
      </section>

      <nav className="flex items-center justify-end gap-2 text-sm" aria-label="Paginare știri">
        <Link
          className={`rounded border border-white/10 px-2 py-1 transition hover:border-teal-200/40 ${
            current <= 1 ? "pointer-events-none opacity-40" : ""
          }`}
          href={`?${new URLSearchParams({
            ...Object.fromEntries(paginationParams.entries()),
            page: String(Math.max(1, current - 1)),
          }).toString()}`}
          aria-disabled={current <= 1}
        >
          Înapoi
        </Link>
        <Link
          className={`rounded border border-white/10 px-2 py-1 transition hover:border-teal-200/40 ${
            current >= totalPages ? "pointer-events-none opacity-40" : ""
          }`}
          href={`?${new URLSearchParams({
            ...Object.fromEntries(paginationParams.entries()),
            page: String(Math.min(totalPages, current + 1)),
          }).toString()}`}
          aria-disabled={current >= totalPages}
        >
          Înainte
        </Link>
        <span className="ml-2 text-neutral-400">
          Pagina {current} / {totalPages}
        </span>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd ? [collectionJsonLd, itemListJsonLd] : [collectionJsonLd]),
        }}
      />
    </main>
  );
}
