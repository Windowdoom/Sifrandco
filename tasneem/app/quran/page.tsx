"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionTitle } from "@/components/Brand";

interface SurahMeta { id: number; name_simple: string; name_arabic: string; revelation_place: string; verses_count: number; translated_name: { name: string }; }

export default function Quran() {
  const [list, setList] = useState<SurahMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("https://api.quran.com/api/v4/chapters?language=en")
      .then((r) => r.json())
      .then((data) => setList(data.chapters))
      .catch((e) => setError(e?.message ?? "Could not load surah list."));
  }, []);

  const filtered = list?.filter((s) =>
    !q || s.name_simple.toLowerCase().includes(q.toLowerCase()) || s.translated_name.name.toLowerCase().includes(q.toLowerCase()) || String(s.id) === q
  );

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Kalam Allah · The Recited" title="Quran" />

      <div className="card mb-4 p-4 text-xs text-tayba-900/70 dark:text-paper-200/70">
        Text & translations powered by <a href="https://quran.com" className="text-gold-500 underline" target="_blank" rel="noopener">quran.com</a> · Arabic from <a href="https://tanzil.net" className="text-gold-500 underline" target="_blank" rel="noopener">tanzil.net</a>. Default translation: Sahih International.
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search surah (name, meaning, or number)…"
        className="mb-4 w-full rounded-2xl border border-paper-200 bg-paper-50 px-4 py-2.5 text-sm outline-none focus:border-gold-400 dark:border-tayba-700 dark:bg-tayba-800"/>

      {error && <div className="card p-4 text-sm text-red-700">Could not load: {error}</div>}
      {!list && !error && <div className="text-center text-sm text-tayba-900/60">Loading…</div>}

      <div className="space-y-2">
        {filtered?.map((s) => (
          <Link key={s.id} href={`/quran/${s.id}`} className="card flex items-center justify-between p-3 transition hover:border-gold-400">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full border border-gold-400/60 text-xs text-gold-500">{s.id}</div>
              <div>
                <div className="font-serif text-base text-tayba-700 dark:text-paper-50">{s.name_simple}</div>
                <div className="text-[11px] text-tayba-900/60 dark:text-paper-200/60">{s.translated_name.name} · {s.verses_count} ayat · {s.revelation_place}</div>
              </div>
            </div>
            <div className="arabic text-xl text-tayba-700 dark:text-paper-50">{s.name_arabic}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
