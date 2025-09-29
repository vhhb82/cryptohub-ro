import { getInstruments } from "@/lib/instrumente";

export default async function InstrumentsPage() {
  const instruments = await getInstruments(); // <- asta e lista

  return (
    <section className="space-y-6 px-6 lg:px-20">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instruments.map((x) => (
          <div key={`${x.rank}-${x.name}`} className="card p-5 rounded-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{x.name}</h3>
              {x.rank != null && <span className="text-sm opacity-70">#{x.rank}</span>}
            </div>

            {x.description && (
              <p className="mt-2 text-sm opacity-80">{x.description}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {x.tags?.map((t) => (
                <span key={t} className="badge">{t}</span>
              ))}
            </div>

            <div className="mt-4">
              <a
                href={x.referralUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                Deschide
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}




