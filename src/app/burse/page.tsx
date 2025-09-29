import rows from "@/data/exchanges.json";

type Row = { rank: number; name: string; description: string; referralUrl: string; badge?: string; };

export default function BursePage() {
  const exchanges = (rows as Row[]).filter(
    (x) => x.name !== "TradingView" && x.name !== "Altrady"
  );

  return (
    <section className="container-site space-y-6 pt-10">
      <h1 className="text-2xl md:text-3xl font-semibold">Top Burse</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {exchanges.map((x) => (
          <div key={x.rank} className="card">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold">
                {x.rank}. {x.name}
              </h3>
              {x.badge ? <span className="badge">{x.badge}</span> : null}
            </div>

            <p className="mt-2 text-sm text-neutral-300">{x.description}</p>

            <a
              href={x.referralUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-4"
            >
              Înregistrează-te
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
