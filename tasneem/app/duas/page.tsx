"use client";
import { useMemo, useState } from "react";
import { SectionTitle } from "@/components/Brand";
import { DUAS, type Dua } from "@/data/duas";

const CATEGORIES = ["All", "Morning", "Evening", "Sleep", "Wake", "Food", "Travel", "Distress", "Forgiveness", "After Salah"] as const;

export default function Duas() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const list = useMemo(() => cat === "All" ? DUAS : DUAS.filter((d) => d.category === cat), [cat]);

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Hisn al-Muslim · Verified" title="Duas & Adhkar" />

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${
              cat === c ? "border-gold-400 bg-gold-50 text-tayba-700"
              : "border-paper-200 text-tayba-900/70 dark:border-tayba-700 dark:text-paper-200/70"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.map((d) => <DuaCard key={d.id} dua={d} />)}
      </div>

      <p className="mt-6 text-center text-[11px] text-tayba-900/50 dark:text-paper-200/50">
        Every dua here cites its primary source from the Quran or the Six Books of Hadith.
        Cross-reference: Hisn al-Muslim by Sa'id al-Qahtani.
      </p>
    </div>
  );
}

function DuaCard({ dua }: { dua: Dua }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gold-500">{dua.category}{dua.repeat ? ` · ×${dua.repeat}` : ""}</div>
          <h3 className="mt-0.5 font-serif text-lg text-tayba-700 dark:text-paper-50">{dua.title}</h3>
        </div>
        <button onClick={() => setOpen(!open)} className="text-xs text-gold-500 underline">{open ? "Hide" : "Show"}</button>
      </div>

      <div className="arabic mt-3 text-2xl text-tayba-900 dark:text-paper-50">{dua.arabic}</div>

      {open && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="italic text-tayba-900/70 dark:text-paper-200/70">{dua.transliteration}</div>
          <div>{dua.translation}</div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-tayba-900/55 dark:text-paper-200/55">{dua.reference}</span>
        {dua.refUrl && (
          <a href={dua.refUrl} target="_blank" rel="noopener noreferrer" className="text-gold-500 underline">verify</a>
        )}
      </div>
    </div>
  );
}
