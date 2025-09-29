'use client';

import { useMemo, useState } from 'react';

/** Tipuri simple pentru UI */
type Side = 'Long' | 'Short';

type Leg = {
  exchange: string;
  side: Side;
  fundingPctPer8h: number; // ex: 0.02 => 0.02%
  takerFeePctPerTrade: number; // ex: 0.06 => 0.06%
};

const EXCHANGES = [
  'Binance',
  'Bybit',
  'OKX',
  'Bitget',
  'KuCoin',
  'Gate.io',
  'MEXC',
  'HTX (Huobi)',
  'Phemex',
  'Bitmart',
  'LBank',
  'Kraken',
  'Bitstamp',
];

export default function FundingArbCalculator() {
  // === Setări generale
  const [capitalPerLeg, setCapitalPerLeg] = useState<number>(1000);
  const [leverage, setLeverage] = useState<number>(10);
  const [hoursToFunding, setHoursToFunding] = useState<number>(8);

  // === Leg A
  const [legA, setLegA] = useState<Leg>({
    exchange: 'Bybit',
    side: 'Short',
    fundingPctPer8h: 0.02,        // 0.02% / 8h
    takerFeePctPerTrade: 0.06,     // 0.06% / tranzacție
  });

  // === Leg B
  const [legB, setLegB] = useState<Leg>({
    exchange: 'Binance',
    side: 'Long',
    fundingPctPer8h: 0.01,        // 0.01% / 8h
    takerFeePctPerTrade: 0.06,     // 0.06% / tranzacție
  });

  // Derivate
  const notionalPerLeg = useMemo(() => capitalPerLeg * leverage, [capitalPerLeg, leverage]);
  const periodFactor = useMemo(() => Math.max(hoursToFunding, 0) / 8, [hoursToFunding]);

  /**
   * PnL funding pentru o poziție:
   *  - Dacă rata > 0, LONG plătește, SHORT încasează.
   *  - Dacă rata < 0, LONG încasează, SHORT plătește.
   *  Returnăm PnL (USDT) pozitiv = încasezi, negativ = plătești.
   */
  const fundingPnlLeg = (fundingPctPer8h: number, side: Side) => {
    const rate = fundingPctPer8h / 100; // din % în fracție
    const signed = side === 'Long' ? -rate : rate; // Long plătește când +; Short încasează când +
    return notionalPerLeg * signed * periodFactor;
  };

  const fundingPnlA = fundingPnlLeg(legA.fundingPctPer8h, legA.side);
  const fundingPnlB = fundingPnlLeg(legB.fundingPctPer8h, legB.side);
  const fundingTotal = fundingPnlA + fundingPnlB;

  // Comisioane: 2 tranzacții / leg (intrare + ieșire) => 4 tranzacții total
  // fee = notional * (fee%/100) * nrTranzacții
  const feesA = notionalPerLeg * (legA.takerFeePctPerTrade / 100) * 2;
  const feesB = notionalPerLeg * (legB.takerFeePctPerTrade / 100) * 2;
  const totalFees = feesA + feesB;

  const netResult = fundingTotal - totalFees;

  // Helpers UI
  const num = (x: number, p = 2) => x.toLocaleString('ro-RO', { minimumFractionDigits: p, maximumFractionDigits: p });

  return (
    <section className="space-y-6 px-6 lg:px-20">
      <h1 className="h1">Calculator Arbitraj Rata de Finanțare</h1>

      {/* ====== Cards / Setări ====== */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Card Setări generale */}
        <div className="card p-5 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Setări generale</h3>

          <div className="space-y-4">
            <div>
              <label className="label">Capital per leg (USDT)</label>
              <input
                className="input"
                type="number"
                min={0}
                value={capitalPerLeg}
                onChange={(e) => setCapitalPerLeg(Number(e.target.value || 0))}
                placeholder="1000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Levier</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value || 1))}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="label">Ore până la funding</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={hoursToFunding}
                  onChange={(e) => setHoursToFunding(Number(e.target.value || 0))}
                  placeholder="8"
                />
              </div>
            </div>

            <p className="muted text-sm">
              Notional/leg: <span className="badge">{num(notionalPerLeg, 0)} USDT</span>
            </p>
          </div>
        </div>

        {/* Card Leg A */}
        <div className="card p-5 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Leg A</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Exchange</label>
                <select
                  className="input"
                  value={legA.exchange}
                  onChange={(e) => setLegA((s) => ({ ...s, exchange: e.target.value }))}
                >
                  {EXCHANGES.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Side</label>
                <select
                  className="input"
                  value={legA.side}
                  onChange={(e) => setLegA((s) => ({ ...s, side: e.target.value as Side }))}
                >
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Funding (% / 8h)</label>
                <input
                  className="input"
                  type="number"
                  step="0.001"
                  value={legA.fundingPctPer8h}
                  onChange={(e) => setLegA((s) => ({ ...s, fundingPctPer8h: Number(e.target.value || 0) }))}
                  placeholder="0.02"
                />
              </div>
              <div>
                <label className="label">Taker fee (% / trade)</label>
                <input
                  className="input"
                  type="number"
                  step="0.001"
                  value={legA.takerFeePctPerTrade}
                  onChange={(e) => setLegA((s) => ({ ...s, takerFeePctPerTrade: Number(e.target.value || 0) }))}
                  placeholder="0.06"
                />
              </div>
            </div>

            <p className="muted text-sm">
              Funding PnL: <span className={`badge ${fundingPnlA >= 0 ? '' : '!bg-[rgba(255,80,80,.1)] !border-[rgba(255,80,80,.5)]'}`}>
                {fundingPnlA >= 0 ? '+' : ''}{num(fundingPnlA)} USDT
              </span>
            </p>
          </div>
        </div>

        {/* Card Leg B */}
        <div className="card p-5 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Leg B</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Exchange</label>
                <select
                  className="input"
                  value={legB.exchange}
                  onChange={(e) => setLegB((s) => ({ ...s, exchange: e.target.value }))}
                >
                  {EXCHANGES.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Side</label>
                <select
                  className="input"
                  value={legB.side}
                  onChange={(e) => setLegB((s) => ({ ...s, side: e.target.value as Side }))}
                >
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Funding (% / 8h)</label>
                <input
                  className="input"
                  type="number"
                  step="0.001"
                  value={legB.fundingPctPer8h}
                  onChange={(e) => setLegB((s) => ({ ...s, fundingPctPer8h: Number(e.target.value || 0) }))}
                  placeholder="0.01"
                />
              </div>
              <div>
                <label className="label">Taker fee (% / trade)</label>
                <input
                  className="input"
                  type="number"
                  step="0.001"
                  value={legB.takerFeePctPerTrade}
                  onChange={(e) => setLegB((s) => ({ ...s, takerFeePctPerTrade: Number(e.target.value || 0) }))}
                  placeholder="0.06"
                />
              </div>
            </div>

            <p className="muted text-sm">
              Funding PnL: <span className={`badge ${fundingPnlB >= 0 ? '' : '!bg-[rgba(255,80,80,.1)] !border-[rgba(255,80,80,.5)]'}`}>
                {fundingPnlB >= 0 ? '+' : ''}{num(fundingPnlB)} USDT
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ====== Rezultate ====== */}
      <div className="card p-5 md:p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-2">Rezultate</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="muted text-sm mb-1">Net funding (% / 8h, ajustat)</div>
            <div className="text-2xl font-semibold">
              {num(((legA.side === 'Short' ? legA.fundingPctPer8h : -legA.fundingPctPer8h) +
                    (legB.side === 'Short' ? legB.fundingPctPer8h : -legB.fundingPctPer8h)) * periodFactor, 5)}%
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="muted text-sm mb-1">Funding PnL</div>
            <div className={`text-2xl font-semibold ${fundingTotal >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {fundingTotal >= 0 ? '+' : ''}{num(fundingTotal)} USDT
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="muted text-sm mb-1">Taxe (approx.)</div>
            <div className="text-2xl font-semibold">{num(totalFees)} USDT</div>
          </div>
        </div>

        <div className="p-4 mt-2 rounded-xl border border-white/10 bg-white/5">
          <div className="muted text-sm mb-1">Rezultat net</div>
          <div className={`text-3xl font-semibold ${netResult >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {netResult >= 0 ? '+' : ''}{num(netResult)} USDT
          </div>

          <p className="muted text-xs mt-3">
            Notă: intervalul standard este 8h. Ajustează „Ore până la funding” conform bursei.
            Comisioanele reale depind de nivelul tău de fees, maker/taker și eventuale discounturi.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ====== Stiluri utilitare compatibile cu tema ta (Tailwind + global.css existent) ======
   Dacă nu ai clasele .input și .label în globals.css, poți păstra acest bloc ca fallback.
   Ideal: adaugă-le în globals.css pentru reutilizare globală.
*/

