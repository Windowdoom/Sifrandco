"use client";
import { useState } from "react";
import { SectionTitle } from "@/components/Brand";
import { NAMES_99 } from "@/data/names-99";

export default function Names() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const filtered = NAMES_99.filter((n) =>
    !q || n.transliteration.toLowerCase().includes(q.toLowerCase()) ||
    n.meaning.toLowerCase().includes(q.toLowerCase()) ||
    n.arabic.includes(q)
  );

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Asma' al-Husna" title="The 99 Names" />

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by meaning, name, or Arabic…"
        className="w-full rounded-2xl border border-paper-200 bg-paper-50 px-4 py-2.5 text-sm outline-none focus:border-gold-400 dark:border-tayba-700 dark:bg-tayba-800"/>

      <p className="mt-3 text-[11px] text-tayba-900/50 dark:text-paper-200/50">
        Hadith: <em>"Allah has ninety-nine names, one hundred less one. Whoever enumerates them will enter Paradise."</em>, Sahih al-Bukhari 2736, Sahih Muslim 2677.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {filtered.map((n) => (
          <button key={n.no} onClick={() => setSelected(n.no)}
            className="card p-3 text-left transition hover:border-gold-400">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-gold-500">{n.no}</span>
              <span className="arabic text-xl text-tayba-700 dark:text-paper-50">{n.arabic}</span>
            </div>
            <div className="mt-1 text-sm font-medium">{n.transliteration}</div>
            <div className="text-xs text-tayba-900/60 dark:text-paper-200/60">{n.meaning}</div>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div onClick={() => setSelected(null)} className="fixed inset-0 z-50 grid place-items-center bg-tayba-900/60 p-6 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="card max-w-md p-6 text-center geo-pattern relative">
            {(() => { const n = NAMES_99[selected - 1]; return (
              <div className="relative z-10">
                <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">No. {n.no}</div>
                <div className="arabic mt-2 text-5xl text-tayba-700 dark:text-paper-50">{n.arabic}</div>
                <div className="mt-3 font-serif text-2xl">{n.transliteration}</div>
                <div className="gold-rule my-4" />
                <div className="text-base">{n.meaning}</div>
                <button onClick={() => setSelected(null)} className="btn-primary mt-6">Close</button>
              </div>
            ); })()}
          </div>
        </div>
      )}
    </div>
  );
}
