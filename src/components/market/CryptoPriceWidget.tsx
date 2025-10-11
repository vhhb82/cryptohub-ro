const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
];

const priceFormatter = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const changeFormatter = new Intl.NumberFormat("ro-RO", {
  style: "percent",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  signDisplay: "always",
});

type CoinMarket = {
  id: string;
  price?: number;
  change24h?: number;
};

async function fetchMarketPrices(): Promise<CoinMarket[]> {
  const ids = COINS.map((coin) => coin.id).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 180 },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko response ${response.status}`);
    }

    const data: Record<string, { usd: number; usd_24h_change?: number }> =
      await response.json();

    return COINS.map((coin) => ({
      id: coin.id,
      price: data[coin.id]?.usd,
      change24h: data[coin.id]?.usd_24h_change,
    }));
  } catch {
    return COINS.map((coin) => ({ id: coin.id }));
  }
}

function renderChange(change?: number): { value: string; className: string } {
  if (change === undefined || Number.isNaN(change)) {
    return { value: "-", className: "text-neutral-400" };
  }

  const className = change > 0 ? "text-teal-300" : change < 0 ? "text-rose-300" : "text-neutral-400";
  const formatted = changeFormatter.format(change / 100);
  return { value: formatted, className };
}

export default async function CryptoPriceWidget() {
  const markets = await fetchMarketPrices();
  const fetchedAt = new Date().toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const allUnavailable = markets.every((coin) => coin.price === undefined);

  return (
    <div className="max-w-md rounded-2xl border border-white/15 bg-black/40 p-6 text-white shadow-lg">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">Piata crypto</p>
          <h2 className="text-xl font-semibold text-white">Top monede</h2>
        </div>
        <span className="text-xs text-neutral-400">Actualizat {fetchedAt}</span>
      </header>

      <div className="mt-5 space-y-3">
        {markets.map((coin) => {
          const meta = COINS.find((c) => c.id === coin.id)!;
          const price = coin.price !== undefined ? priceFormatter.format(coin.price) : "-";
          const change = renderChange(coin.change24h);

          return (
            <div
              key={coin.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-teal-300/40 hover:bg-white/10"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{meta.symbol}</span>
                <span className="text-xs text-neutral-400">{meta.name}</span>
              </div>
              <div className="text-right">
                <span className="block text-sm font-semibold text-white">{price}</span>
                <span className={`text-xs font-medium ${change.className}`}>{change.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-neutral-500">
        {allUnavailable
          ? "Preturile sunt indisponibile momentan. Incearca din nou in cateva minute."
          : "Date furnizate de CoinGecko. Valorile pot avea intarzieri de cateva minute."}
      </p>
    </div>
  );
}
