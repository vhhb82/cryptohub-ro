"use client";

import { useMemo, useState } from "react";

type Side = "Long" | "Short";

type Leg = {
  exchange: string;
  side: Side;
  fundingPctPer8h: string;
  takerFeePctPerTrade: string;
};

const EXCHANGES = [
  "Binance",
  "Bybit",
  "OKX",
  "Bitget",
  "KuCoin",
  "Gate.io",
  "MEXC",
  "HTX (Huobi)",
  "Phemex",
  "Bitmart",
  "LBank",
  "Kraken",
  "Bitstamp",
] as const;

const formatNumber = (value: number, precision = 2) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString("ro-RO", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

const normalizeNumericInput = (raw: string): string => {
  if (!raw) return "";
  const withoutSpaces = raw.replace(/\s+/g, "").replace(/,/g, ".");
  const sign = withoutSpaces.startsWith("-") || withoutSpaces.startsWith("+") ? withoutSpaces[0] : "";
  const rest = (sign ? withoutSpaces.slice(1) : withoutSpaces)
    .replace(/[+-]/g, "")
    .replace(/[^0-9.]/g, "");

  if (!rest) {
    return sign;
  }

  const parts = rest.split(".");
  const integer = parts.shift() ?? "";
  const decimals = parts.join("");
  const hasTrailingDot = rest.endsWith(".") && decimals === "";
  const decimalFragment = decimals ? `.${decimals}` : hasTrailingDot ? "." : "";

  return `${sign}${integer}${decimalFragment}`;
};

const parsePercentInput = (raw: string): number => {
  const cleaned = raw.trim();
  if (!cleaned || cleaned === "-" || cleaned === "+") {
    return 0;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clampFee = (value: number) => Math.max(0, value);

export default function FundingCalculatorClient() {
  const [capitalPerLeg, setCapitalPerLeg] = useState<number>(1000);
  const [leverage, setLeverage] = useState<number>(10);
  const [hoursToFunding, setHoursToFunding] = useState<number>(8);

  const [legA, setLegA] = useState<Leg>({
    exchange: "Bybit",
    side: "Short",
    fundingPctPer8h: "0.02",
    takerFeePctPerTrade: "0.06",
  });

  const [legB, setLegB] = useState<Leg>({
    exchange: "Binance",
    side: "Long",
    fundingPctPer8h: "0.01",
    takerFeePctPerTrade: "0.06",
  });

  const notionalPerLeg = useMemo(() => capitalPerLeg * leverage, [capitalPerLeg, leverage]);
  const periodFactor = useMemo(() => Math.max(hoursToFunding, 0) / 8, [hoursToFunding]);

  const fundingPctA = parsePercentInput(legA.fundingPctPer8h);
  const fundingPctB = parsePercentInput(legB.fundingPctPer8h);
  const takerFeePctA = clampFee(parsePercentInput(legA.takerFeePctPerTrade));
  const takerFeePctB = clampFee(parsePercentInput(legB.takerFeePctPerTrade));

  const fundingPnlForLeg = (fundingPctPer8h: number, side: Side) => {
    const rate = fundingPctPer8h / 100;
    const signed = side === "Long" ? -rate : rate;
    return notionalPerLeg * signed * periodFactor;
  };

  const fundingPnlA = fundingPnlForLeg(fundingPctA, legA.side);
  const fundingPnlB = fundingPnlForLeg(fundingPctB, legB.side);
  const fundingTotal = fundingPnlA + fundingPnlB;

  const feesA = notionalPerLeg * (takerFeePctA / 100) * 2;
  const feesB = notionalPerLeg * (takerFeePctB / 100) * 2;
  const totalFees = feesA + feesB;

  const netResult = fundingTotal - totalFees;

  const netFundingPercent =
    ((legA.side === "Short" ? fundingPctA : -fundingPctA) + (legB.side === "Short" ? fundingPctB : -fundingPctB)) *
    periodFactor;

  const fundingBadgeClass = (value: number) =>
    value >= 0 ? "" : "!bg-[rgba(255,80,80,.1)] !border-[rgba(255,80,80,.5)]";

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="card p-5 md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Setari generale</h2>

          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="capital">
                Capital per leg (USDT)
              </label>
              <input
                id="capital"
                className="input"
                type="number"
                min={0}
                value={capitalPerLeg}
                onChange={(event) => setCapitalPerLeg(Number(event.target.value || 0))}
                placeholder="1000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="leverage">
                  Levier
                </label>
                <input
                  id="leverage"
                  className="input"
                  type="number"
                  min={1}
                  value={leverage}
                  onChange={(event) => setLeverage(Number(event.target.value || 1))}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="label" htmlFor="hours">
                  Ore pana la funding
                </label>
                <input
                  id="hours"
                  className="input"
                  type="number"
                  min={0}
                  value={hoursToFunding}
                  onChange={(event) => setHoursToFunding(Number(event.target.value || 0))}
                  placeholder="8"
                />
              </div>
            </div>
          </div>
        </article>

        <article className="card p-5 md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Leg A</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="exchangeA">
                  Exchange
                </label>
                <select
                  id="exchangeA"
                  className="input"
                  value={legA.exchange}
                  onChange={(event) => setLegA((state) => ({ ...state, exchange: event.target.value }))}
                >
                  {EXCHANGES.map((exchange) => (
                    <option key={exchange} value={exchange}>
                      {exchange}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="sideA">
                  Directie
                </label>
                <select
                  id="sideA"
                  className="input"
                  value={legA.side}
                  onChange={(event) => setLegA((state) => ({ ...state, side: event.target.value as Side }))}
                >
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="fundingA">
                  Funding (% / 8h)
                </label>
                <input
                  id="fundingA"
                  className="input"
                  type="text"
                  inputMode="decimal"
                  value={legA.fundingPctPer8h}
                  onChange={(event) =>
                    setLegA((state) => ({
                      ...state,
                      fundingPctPer8h: normalizeNumericInput(event.target.value),
                    }))
                  }
                  placeholder="0.02"
                />
              </div>
              <div>
                <label className="label" htmlFor="feeA">
                  Taker fee (% / tranzactie)
                </label>
                <input
                  id="feeA"
                  className="input"
                  type="text"
                  inputMode="decimal"
                  value={legA.takerFeePctPerTrade}
                  onChange={(event) =>
                    setLegA((state) => ({
                      ...state,
                      takerFeePctPerTrade: normalizeNumericInput(event.target.value),
                    }))
                  }
                  placeholder="0.06"
                />
              </div>
            </div>

            <p className="muted text-sm">
              Funding PnL:{" "}
              <span className={`badge ${fundingBadgeClass(fundingPnlA)}`}>
                {fundingPnlA >= 0 ? "+" : ""}
                {formatNumber(fundingPnlA)} USDT
              </span>
            </p>
          </div>
        </article>

        <article className="card p-5 md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Leg B</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="exchangeB">
                  Exchange
                </label>
                <select
                  id="exchangeB"
                  className="input"
                  value={legB.exchange}
                  onChange={(event) => setLegB((state) => ({ ...state, exchange: event.target.value }))}
                >
                  {EXCHANGES.map((exchange) => (
                    <option key={exchange} value={exchange}>
                      {exchange}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="sideB">
                  Directie
                </label>
                <select
                  id="sideB"
                  className="input"
                  value={legB.side}
                  onChange={(event) => setLegB((state) => ({ ...state, side: event.target.value as Side }))}
                >
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="fundingB">
                  Funding (% / 8h)
                </label>
                <input
                  id="fundingB"
                  className="input"
                  type="text"
                  inputMode="decimal"
                  value={legB.fundingPctPer8h}
                  onChange={(event) =>
                    setLegB((state) => ({
                      ...state,
                      fundingPctPer8h: normalizeNumericInput(event.target.value),
                    }))
                  }
                  placeholder="0.01"
                />
              </div>
              <div>
                <label className="label" htmlFor="feeB">
                  Taker fee (% / tranzactie)
                </label>
                <input
                  id="feeB"
                  className="input"
                  type="text"
                  inputMode="decimal"
                  value={legB.takerFeePctPerTrade}
                  onChange={(event) =>
                    setLegB((state) => ({
                      ...state,
                      takerFeePctPerTrade: normalizeNumericInput(event.target.value),
                    }))
                  }
                  placeholder="0.06"
                />
              </div>
            </div>

            <p className="muted text-sm">
              Funding PnL:{" "}
              <span className={`badge ${fundingBadgeClass(fundingPnlB)}`}>
                {fundingPnlB >= 0 ? "+" : ""}
                {formatNumber(fundingPnlB)} USDT
              </span>
            </p>
          </div>
        </article>
      </div>

      <section className="card space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
        <h2 className="text-lg font-semibold text-white">Rezultate</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="muted mb-1 text-sm">Net funding (% / 8h, ajustat)</p>
            <p className="text-2xl font-semibold text-white">{formatNumber(netFundingPercent, 5)}%</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="muted mb-1 text-sm">Funding PnL</p>
            <p className={`text-2xl font-semibold ${fundingTotal >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {fundingTotal >= 0 ? "+" : ""}
                  {formatNumber(fundingTotal)} USDT
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="muted mb-1 text-sm">Taxe estimate</p>
            <p className="text-2xl font-semibold text-white">{formatNumber(totalFees)} USDT</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="muted mb-1 text-sm">Rezultat net</p>
          <p className={`text-3xl font-semibold ${netResult >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {netResult >= 0 ? "+" : ""}
            {formatNumber(netResult)} USDT
          </p>

          <p className="muted mt-3 text-xs">
            Nota: intervalul standard este 8h. Ajusteaza campul <span className="italic">Ore pana la funding</span> in functie de
            bursa. Comisioanele reale depind de nivelul tau de fees, de rolul maker/taker si de eventuale discounturi.
          </p>
        </div>
      </section>
    </section>
  );
}
