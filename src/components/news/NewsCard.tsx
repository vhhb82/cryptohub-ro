import { type News } from "contentlayer/generated";
import Link from "next/link";
import Image from "next/image";

function safeSlug(n: News) {
  return (
    n.slug ??
    n.slugAsParams ??
    n._raw.flattenedPath.replace(/^news\//, "")
  );
}

export default function NewsCard({ item }: { item: News }) {
  const href = `/stiri/${safeSlug(item)}`;
  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  return (
    <article className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {item.cover && (
        <div className="relative aspect-[16/9]">
          <Image
            src={item.cover}
            alt={item.title || ""}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>
      )}

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold leading-snug">{item.title}</h3>
        <p className="text-xs text-neutral-400">
          {dateStr}
          {item.source ? ` · ${item.source}` : ""}
        </p>

        {!!item.tags?.length && (
          <div className="flex gap-2 flex-wrap">
            {item.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] rounded-full px-2 py-0.5 bg-white/10 border border-white/15"
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
