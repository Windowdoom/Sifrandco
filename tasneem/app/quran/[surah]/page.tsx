"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionTitle } from "@/components/Brand";

interface Verse { id: number; verse_key: string; text_uthmani: string; translations: { resource_id: number; text: string }[]; }

// Sahih International = translation id 20 on quran.com api.
const SAHIH_INTL = 20;

export default function SurahPage({ params }: { params: { surah: string } }) {
  const id = params.surah;
  const [chapter, setChapter] = useState<any>(null);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, v] = await Promise.all([
          fetch(`https://api.quran.com/api/v4/chapters/${id}?language=en`).then((r) => r.json()),
          fetch(`https://api.quran.com/api/v4/verses/by_chapter/${id}?language=en&words=false&translations=${SAHIH_INTL}&fields=text_uthmani&per_page=300`).then((r) => r.json()),
        ]);
        setChapter(c.chapter);
        setVerses(v.verses);
      } catch (e: any) { setError(e?.message ?? "Could not load surah."); }
    })();
  }, [id]);

  return (
    <div className="px-4 pt-8">
      <Link href="/quran" className="text-xs text-gold-500 underline">← All surahs</Link>
      {chapter && (
        <div className="mt-4 text-center">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">Surah {chapter.id}</div>
          <div className="font-serif text-3xl text-tayba-700 dark:text-paper-50">{chapter.name_simple}</div>
          <div className="arabic text-3xl mt-1 text-tayba-700 dark:text-paper-50">{chapter.name_arabic}</div>
          <div className="text-xs text-tayba-900/60 dark:text-paper-200/60 mt-1">{chapter.translated_name.name} · {chapter.verses_count} ayat · {chapter.revelation_place}</div>
          <div className="gold-rule my-4" />
          {chapter.bismillah_pre && <div className="arabic text-2xl text-tayba-700 dark:text-paper-50">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>}
        </div>
      )}

      {error && <div className="card mt-6 p-4 text-sm text-red-700">{error}</div>}
      {!verses && !error && (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card space-y-2 p-5">
              <div className="h-2.5 w-12 animate-pulse rounded bg-paper-100 dark:bg-tayba-700/40" />
              <div className="h-6 w-full animate-pulse rounded bg-paper-100 dark:bg-tayba-700/40" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-paper-100/70 dark:bg-tayba-700/30" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-4">
        {verses?.map((v) => (
          <div key={v.id} className="card p-5">
            <div className="flex items-baseline justify-between">
              <div className="text-[10px] tracking-widest text-gold-500">{v.verse_key}</div>
            </div>
            <div className="arabic mt-2 text-2xl leading-loose text-tayba-900 dark:text-paper-50">{v.text_uthmani}</div>
            {v.translations?.[0]?.text && (
              <div className="mt-3 text-sm text-tayba-900/80 dark:text-paper-200/80"
                dangerouslySetInnerHTML={{ __html: v.translations[0].text }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
