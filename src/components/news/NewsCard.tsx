import { type NewsItem } from "@/lib/news";
import Link from "next/link";
import Image from "next/image";

function safeSlug(n: NewsItem) {
  return n.slug;
}

export default function NewsCard({ item }: { item: NewsItem }) {
  const href = `/stiri/${safeSlug(item)}`;
  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  return (
    <article className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-sm transition hover:shadow-md">
      {item.cover && (
        <div className="relative aspect-[16/9]">
          <Image
            src={item.cover}
            alt={item.title || ""}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
          />
        </div>
      )}

      <div className="space-y-3 p-4">
        <h3 className="text-lg font-semibold leading-snug text-neutral-900">{item.title}</h3>
        <p className="text-xs text-neutral-600">
          {dateStr}
          {item.source ? ` - ${item.source}` : ""}
        </p>

        {!!item.tags?.length && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-neutral-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* link invizibil peste card */}
      <Link href={href} className="absolute inset-0" aria-label={item.title} />
    </article>
  );
}
