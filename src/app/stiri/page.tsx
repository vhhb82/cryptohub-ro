import { getAllNews } from "@/lib/news";
import NewsCard from "@/components/news/NewsCard";

export const revalidate = 60; // ISR

export default async function StiriPage({
  searchParams,
}: {
  searchParams?: Promise<{ tag?: string; page?: string; perPage?: string }>;
}) {
  const p = await searchParams;
  const tag = p?.tag?.trim();
  const perPage = Math.min(50, Math.max(1, Number(p?.perPage ?? 12)));
  const page = Math.max(1, Number(p?.page ?? 1));

  const allNews = await getAllNews();
  const items = [...allNews].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
  const filtered = tag ? items.filter((n) => n.tags?.includes(tag)) : items;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  return (
    <main className="container-site pt-8 space-y-6">
      <h1 className="text-3xl font-semibold">Știri Crypto</h1>

      {/* GRID: 1 col pe mobil, 2 pe md, 3 pe lg */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((n) => (
          <NewsCard
            key={n._id} 
            item={n}
          />
        ))}
      </div>

      {/* paginare minimală */}
      <div className="flex items-center justify-end gap-2 text-sm">
        <a
          className={`rounded border px-2 py-1 ${current <= 1 ? "pointer-events-none opacity-40" : ""}`}
          href={`?${new URLSearchParams({ ...(tag && { tag }), page: String(current - 1), perPage: String(perPage) })}`}
        >
          ← Înapoi
        </a>
        <a
          className={`rounded border px-2 py-1 ${current >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          href={`?${new URLSearchParams({ ...(tag && { tag }), page: String(current + 1), perPage: String(perPage) })}`}
        >
          Înainte →
        </a>
        <span className="ml-2 text-neutral-400">
          Pagina {current} / {totalPages}
        </span>
      </div>
    </main>
  );
}

