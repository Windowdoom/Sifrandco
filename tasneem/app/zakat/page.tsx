"use client";
import { useMemo, useState } from "react";
import { SectionTitle } from "@/components/Brand";

// Nisab thresholds (per traditional fiqh):
//   - 87.48 g gold  OR  612.36 g silver (use the lower of the two for hayl, per majority view; some use gold).
// User enters current spot prices (per gram) for their currency.

export default function Zakat() {
  const [goldPricePerGram, setGold] = useState(70);
  const [silverPricePerGram, setSilver] = useState(0.8);
  const [cash, setCash] = useState(0);
  const [savings, setSavings] = useState(0);
  const [goldHeld, setGoldHeld] = useState(0);
  const [silverHeld, setSilverHeld] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [businessAssets, setBusinessAssets] = useState(0);
  const [debts, setDebts] = useState(0);

  const nisabGold = goldPricePerGram * 87.48;
  const nisabSilver = silverPricePerGram * 612.36;
  const nisab = Math.min(nisabGold, nisabSilver); // majority view — lower threshold benefits the poor.

  const totalAssets = cash + savings + goldHeld * goldPricePerGram + silverHeld * silverPricePerGram + investments + businessAssets;
  const zakatable = Math.max(0, totalAssets - debts);
  const due = zakatable >= nisab ? zakatable * 0.025 : 0;

  return (
    <div className="px-4 pt-8 space-y-5">
      <SectionTitle kicker="The third pillar" title="Zakat" />

      <div className="card p-5 grid grid-cols-2 gap-3 text-sm">
        <Num label="Gold price / g" value={goldPricePerGram} onChange={setGold} />
        <Num label="Silver price / g" value={silverPricePerGram} onChange={setSilver} />
      </div>

      <div className="card p-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">Your wealth (held ≥ 1 lunar year)</div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Num label="Cash" value={cash} onChange={setCash} />
          <Num label="Savings" value={savings} onChange={setSavings} />
          <Num label="Gold (grams)" value={goldHeld} onChange={setGoldHeld} />
          <Num label="Silver (grams)" value={silverHeld} onChange={setSilverHeld} />
          <Num label="Investments" value={investments} onChange={setInvestments} />
          <Num label="Business assets" value={businessAssets} onChange={setBusinessAssets} />
          <Num label="Debts owed" value={debts} onChange={setDebts} />
        </div>
      </div>

      <div className="card p-5">
        <Row label="Nisab (gold)" value={nisabGold} />
        <Row label="Nisab (silver)" value={nisabSilver} />
        <Row label="Applicable nisab (lower)" value={nisab} highlight />
        <Row label="Total zakatable wealth" value={zakatable} />
        <div className="gold-rule my-3" />
        <Row label="Zakat due (2.5%)" value={due} big />
        {zakatable < nisab && <div className="mt-2 text-[11px] text-tayba-900/60 dark:text-paper-200/60">Below nisab — no zakat is due this year.</div>}
      </div>

      <p className="text-[11px] text-tayba-900/55 dark:text-paper-200/55">
        Reference: Quran 9:60 · Sahih al-Bukhari 1395 · <a href="https://sunnah.com/bukhari:1395" target="_blank" rel="noopener" className="text-gold-500 underline">verify</a>.
        Consult a qualified scholar for edge cases (pension funds, jointly-held property, gold jewellery in regular use).
      </p>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-tayba-900/60 dark:text-paper-200/60">{label}</span>
      <input type="number" min={0} value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="mt-1 w-full rounded-xl border border-paper-200 bg-paper-50 px-3 py-2 outline-none focus:border-gold-400 dark:border-tayba-700 dark:bg-tayba-800" />
    </label>
  );
}

function Row({ label, value, big, highlight }: { label: string; value: number; big?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between py-1 ${highlight ? "text-gold-500" : ""}`}>
      <span className="text-xs">{label}</span>
      <span className={big ? "font-serif text-2xl" : "text-sm font-medium"}>{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
    </div>
  );
}
