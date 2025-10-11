import Link from "next/link";

type TagFilterProps = {
  allTags: string[];
  currentTag: string | null;
  baseQuery?: string;
};

function buildHref(nextTag: string | null, baseQuery?: string): string {
  const params = new URLSearchParams(baseQuery || "");
  if (nextTag) {
    params.set("tag", nextTag);
  } else {
    params.delete("tag");
  }
  params.delete("page");

  const query = params.toString();
  return `/stiri${query ? `?${query}` : ""}`;
}

export default function TagFilter({ allTags, currentTag, baseQuery }: TagFilterProps) {
  if (!allTags.length) return null;

  const normalizedCurrent = currentTag?.toLowerCase() ?? null;

  return (
    <div className="flex flex-wrap gap-2" aria-label="Filtru după etichete">
      <Link
        href={buildHref(null, baseQuery)}
        className={`rounded-full border border-white/10 px-3 py-1 text-sm transition hover:border-teal-200/40 ${
          !normalizedCurrent ? "bg-white/10 text-white" : "text-neutral-300"
        }`}
      >
        Toate
      </Link>
      {allTags.map((tag) => {
        const isActive = normalizedCurrent === tag.toLowerCase();
        return (
          <Link
            key={tag}
            href={buildHref(tag, baseQuery)}
            className={`rounded-full border border-white/10 px-3 py-1 text-sm transition hover:border-teal-200/40 ${
              isActive ? "bg-white/10 text-white" : "text-neutral-300"
            }`}
          >
            {tag}
          </Link>
        );
      })}
    </div>
  );
}
