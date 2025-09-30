import type { Metadata } from "next";
import { getAllNews } from "@/lib/news";
import NewsCard from "@/components/news/NewsCard";

export const revalidate = 60;

const DEFAULT_PER_PAGE = 12;
const MAX_PER_PAGE = 50;

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
  const perPageCandidate = Number.isFinite(parsedPerPage) && parsedPerPage > 0
    ? Math.floor(parsedPerPage)
    : DEFAULT_PER_PAGE;
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
  const title = normalized.tag
    ? `${baseTitle} • ${formatTag(normalized.tag)}`
    : `${baseTitle} actualizate pentru investitori`;

  const description = normalized.tag
    ? `Ultimele știri și analize despre ${formatTag(normalized.tag)} pe piața crypto, actualizate la zi pe CryptoHub Pro.`
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
      url: canonical,
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

  const allNews = await getAllNews();
  const items = [...allNews].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
  const filtered = tag ? items.filter((n) => n.tags?.includes(tag)) : items;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(normalized.page, totalPages);
  const start = (current - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  return (
    <main className="container-site space-y-6 pt-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">
          {tag ? `Știri crypto: ${formatTag(tag)}` : "Știri crypto"}
        </h1>
        <p className="text-sm text-neutral-300">
          Află rapid cele mai noi noutăți din blockchain, token-uri și piața cripto, actualizate constant.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((n) => (
          <NewsCard key={n._id} item={n} />
        ))}
      </div>

      <nav className="flex items-center justify-end gap-2 text-sm" aria-label="Paginare știri">
        <a
          className={`rounded border px-2 py-1 ${current <= 1 ? "pointer-events-none opacity-40" : ""}`}
          href={`?${new URLSearchParams({ ...(tag && { tag }), page: String(current - 1), perPage: String(perPage) })}`}
        >
          Înapoi
        </a>
        <a
          className={`rounded border px-2 py-1 ${current >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          href={`?${new URLSearchParams({ ...(tag && { tag }), page: String(current + 1), perPage: String(perPage) })}`}
        >
          Înainte
        </a>
        <span className="ml-2 text-neutral-400">
          Pagina {current} / {totalPages}
        </span>
      </nav>
    </main>
  );
}
