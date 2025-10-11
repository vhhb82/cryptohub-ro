import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";

type Instrument = {
  rank?: number;
  name: string;
  referralUrl: string;
  description?: string;
  bonus?: string;
  tags?: string[];
  logo?: string;
};

const instrumentsPath = path.join(process.cwd(), "src/data/instruments.json");

const pageTitle = "Instrumente și resurse utile pentru investitorii crypto din România";
const pageDescription =
  "Selectăm instrumente verificate pentru analiză, monitorizare burse și automatizări care te ajută să iei decizii rapide în piața crypto.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/instrumente",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://cryptohub.ro/instrumente",
    type: "article",
  },
  twitter: {
    title: pageTitle,
    description: pageDescription,
  },
};

async function getInstruments(): Promise<Instrument[]> {
  try {
    const fileContent = await fs.readFile(instrumentsPath, "utf8");
    return JSON.parse(fileContent) as Instrument[];
  } catch {
    return [];
  }
}

export default async function InstrumentsPage() {
  const instruments = await getInstruments();

  return (
    <main className="container-site space-y-6 pb-12 pt-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">{pageTitle}</h1>
        <p className="text-sm text-neutral-300">{pageDescription}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3" aria-label="Resurse și instrumente pentru traderi">
        {instruments.map((instrument) => (
          <article key={instrument.name} className="card rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {instrument.rank ? `${instrument.rank}. ${instrument.name}` : instrument.name}
              </h2>
              {instrument.bonus ? (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                  {instrument.bonus}
                </span>
              ) : null}
            </header>

            {instrument.description ? (
              <p className="muted mt-2 text-sm leading-relaxed text-neutral-300">{instrument.description}</p>
            ) : null}

            <a
              href={instrument.referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-4 inline-flex"
            >
              Înregistrează-te
            </a>
          </article>
        ))}

        {!instruments.length && (
          <p className="col-span-full rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-neutral-300">
            Lista de instrumente va fi actualizată în curând. Revino pentru noi recomandări.
          </p>
        )}
      </section>
    </main>
  );
}
