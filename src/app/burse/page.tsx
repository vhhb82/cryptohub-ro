import type { Metadata } from "next";
import rows from "@/data/exchanges.json";

type Row = {
  rank: number;
  name: string;
  description: string;
  referralUrl: string;
  badge?: string;
};

const pageTitle = "Top burse crypto recomandate pentru traderii din România";
const pageDescription =
  "Comparație rapidă între cele mai populare burse crypto folosite de investitorii români, cu detalii despre avantaje, bonusuri și resurse utile.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/burse",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://cryptohub.ro/burse",
    type: "article",
  },
  twitter: {
    title: pageTitle,
    description: pageDescription,
  },
};

export default function BursePage() {
  const exchanges = (rows as Row[]).filter((exchange) => !["TradingView", "Altrady"].includes(exchange.name));

  return (
    <main className="container-site space-y-6 pb-12 pt-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">{pageTitle}</h1>
        <p className="text-sm text-neutral-300">{pageDescription}</p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Listă burse crypto recomandate">
        {exchanges.map((exchange) => (
          <article key={exchange.rank} className="card flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
            <header className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">
                {exchange.rank}. {exchange.name}
              </h2>
              {exchange.badge ? (
                <span className="badge bg-teal-500/20 text-xs font-semibold uppercase tracking-wide text-teal-200">
                  {exchange.badge}
                </span>
              ) : null}
            </header>

            <p className="text-sm leading-relaxed text-neutral-300">{exchange.description}</p>

            <a
              href={exchange.referralUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-auto inline-flex justify-center"
            >
              Înregistrează-te
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
