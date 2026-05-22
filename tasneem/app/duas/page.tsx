"use client";
import { useMemo, useState } from "react";
import { SectionTitle } from "@/components/Brand";
import ShareDua from "@/components/ShareDua";
import { DUAS, type Dua } from "@/data/duas";

const CATEGORIES = ["All", "Morning", "Evening", "Sleep", "Wake", "Wudu", "Salah", "After Salah", "Adhkar", "Home", "Mosque", "Food", "Daily", "Family", "Travel", "Distress", "Forgiveness"] as const;

export default function Duas() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const list = useMemo(() => cat === "All" ? DUAS : DUAS.filter((d) => d.category === cat), [cat]);

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Hisn al-Muslim, verified" title="Duas & Adhkar" />

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
              cat === c
                ? "border-gold-400 bg-gold-50 text-tayba-900 font-medium"
                : "border-paper-200 text-tayba-900/75 hover:border-gold-400/60 dark:border-tayba-700 dark:text-paper-200/70"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {list.map((d) => <DuaCard key={d.id} dua={d} />)}
      </div>

      <p className="mt-8 text-center text-[11px] text-tayba-900/55 dark:text-paper-200/55">
        Every dua here cites its primary source from the Quran or the Six Books of Hadith.
        Cross-reference, Hisn al-Muslim by Sa'id al-Qahtani.
      </p>
    </div>
  );
}

function DuaCard({ dua }: { dua: Dua }) {
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <article className="card p-5">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-gold-600">
            <span>{dua.category}</span>
            {dua.repeat && <span className="text-tayba-900/55">·  ×{dua.repeat}</span>}
          </div>
          <h3 className="mt-1 font-serif text-[1.35rem] font-medium leading-tight text-tayba-900 dark:text-paper-50">
            {dua.title}
          </h3>
          {dua.context && (
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-tayba-900/70 dark:text-paper-200/65">
              {dua.context}
            </p>
          )}
        </div>
        <button
          onClick={() => setShareOpen(true)}
          aria-label="Share dua"
          className="shrink-0 rounded-full border border-paper-200 p-2 text-tayba-800 transition hover:border-gold-400 hover:text-gold-700 dark:border-tayba-700 dark:text-paper-200">
          <ShareIcon />
        </button>
      </header>

      <div className="arabic mt-1 text-[1.55rem] leading-[2.3] text-tayba-900 dark:text-paper-50">
        {dua.arabic}
      </div>

      <p className="mt-3 text-[0.9rem] italic leading-relaxed text-tayba-800/85 dark:text-paper-200/80">
        {dua.transliteration}
      </p>

      <p className="mt-2 text-[0.92rem] leading-relaxed text-tayba-900/85 dark:text-paper-200/85">
        {dua.translation}
      </p>

      <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-paper-200/70 pt-3 text-[11px] dark:border-tayba-700/60">
        {dua.grading && (
          <span className={`rounded-full px-2 py-0.5 font-medium ${
            dua.grading === "Quran" ? "bg-gold-50 text-gold-700"
            : dua.grading === "Sahih" ? "bg-tayba-50 text-tayba-700"
            : "bg-paper-100 text-tayba-800"
          }`}>{dua.grading}</span>
        )}
        <span className="text-tayba-900/65 dark:text-paper-200/60">{dua.reference}</span>
        {dua.refUrl && (
          <a href={dua.refUrl} target="_blank" rel="noopener noreferrer"
             className="ml-auto text-gold-600 underline-offset-2 hover:underline">
            verify ↗
          </a>
        )}
      </footer>
      <ShareDua dua={dua} open={shareOpen} onClose={() => setShareOpen(false)} />
    </article>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8 15.8 6.4M8.2 13.2l7.6 4.4" />
    </svg>
  );
}
