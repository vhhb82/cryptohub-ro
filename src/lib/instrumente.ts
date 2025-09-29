// src/lib/instrumente.ts
import list from "@/data/instruments.json";
import type { Instrument } from "@/data/types";

export type { Instrument };

export async function getInstruments(): Promise<Instrument[]> {
  // 1) încerci să citești din API (dacă ai URL în env)
  const url = process.env.NEXT_PUBLIC_INSTRUMENTS_URL;
  if (url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as unknown;
        if (Array.isArray(data)) return data as Instrument[];
      }
    } catch {
      // ignoră și mergi pe fallback local
    }
  }

  // 2) fallback: JSON-ul local
  return list as Instrument[];
}

