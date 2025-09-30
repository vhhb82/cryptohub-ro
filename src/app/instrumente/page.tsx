
async function getInstruments() {
  const url = process.env.NEXT_PUBLIC_INSTRUMENTS_URL; // seteaz-o în .env și în Vercel
  if (!url) return [];
  const res = await fetch(url, { next: { revalidate: 30 } }); // revalidare la 30s
  if (!res.ok) return [];
  return (await res.json()) as {
    rank?: number;
    name: string;
    referralUrl: string;
    description?: string;
    bonus?: string;
    tags?: string[];
    logo?: string;
  }[];
}

export default async function InstrumentsPage() {
  const instruments = await getInstruments();
  return (
    <section className="space-y-6 px-6 lg:px-20">
      <h1 className="text-2xl md:text-3xl font-semibold">Instrumente</h1>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instruments.map((x) => (
          <div key={x.name} className="card p-4 md:p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {x.rank}. {x.name}
              </h3>
            </div>

            {x.description ? (
              <p className="muted mt-1">{x.description}</p>
            ) : null}

            <a
              href={x.referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-4 inline-flex"
            >
              Înregistrează-te
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

