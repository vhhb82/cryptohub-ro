"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function TagFilter({ allTags }: { allTags: string[] }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const active = sp.get("tag"); // null sau tag

  // în TagFilter
  const buildHref = (nextTag: string | null) => {
    const sp = new URLSearchParams(sp.toString());
    if (nextTag) sp.set("tag", nextTag); else sp.delete("tag");
    sp.delete("page"); // reset page
    return `${pathname}?${sp.toString()}`;
  };


  if (!allTags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={buildHref(null)} className={`px-3 py-1 rounded-full border ${!active ? "bg-white/10" : ""}`}>
        Toate
      </Link>
      {allTags.map(t => (
        <Link
          key={t}
          href={buildHref(t)}
          className={`px-3 py-1 rounded-full border ${active === t ? "bg-white/10" : ""}`}
        >
          {t}
        </Link>
      ))}
    </div>
  );
}

