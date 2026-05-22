import { SectionTitle } from "@/components/Brand";

// We curate hadith from the Six Books verifiable on sunnah.com.
// Forty Hadith of Imam an-Nawawi is a classical, widely-published collection.

const COLLECTIONS = [
  { name: "Sahih al-Bukhari",    url: "https://sunnah.com/bukhari",   notes: "The most rigorously authenticated collection." },
  { name: "Sahih Muslim",        url: "https://sunnah.com/muslim",    notes: "Second of the two Sahihayn." },
  { name: "Sunan Abu Dawud",     url: "https://sunnah.com/abudawud",  notes: "Strong on ahkam (rulings)." },
  { name: "Jami at-Tirmidhi",    url: "https://sunnah.com/tirmidhi",  notes: "Includes grading commentary." },
  { name: "Sunan an-Nasa'i",     url: "https://sunnah.com/nasai",     notes: "Known for strict isnad criteria." },
  { name: "Sunan Ibn Majah",     url: "https://sunnah.com/ibnmajah",  notes: "Completes the Six Books." },
  { name: "40 Hadith Nawawi",    url: "https://sunnah.com/nawawi40",  notes: "The classical foundational forty." },
  { name: "Riyad as-Salihin",    url: "https://sunnah.com/riyadussalihin", notes: "Imam an-Nawawi's gardens of the righteous." },
];

export default function Hadith() {
  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="As-Sittah · The Six Books" title="Hadith" />

      <div className="card p-5 text-sm text-tayba-900/70 dark:text-paper-200/70">
        Every hadith citation in Tasneem links to <a href="https://sunnah.com" target="_blank" rel="noopener" className="text-gold-500 underline">sunnah.com</a>, where you can verify the chain, grading, and original Arabic.
        We only quote sahih and hasan narrations.
      </div>

      <div className="mt-4 space-y-2">
        {COLLECTIONS.map((c) => (
          <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer"
            className="card flex items-center justify-between p-4 transition hover:border-gold-400">
            <div>
              <div className="font-serif text-base text-tayba-700 dark:text-paper-50">{c.name}</div>
              <div className="text-xs text-tayba-900/60 dark:text-paper-200/60">{c.notes}</div>
            </div>
            <div className="text-xs text-gold-500">open ↗</div>
          </a>
        ))}
      </div>

      <p className="mt-6 text-[11px] text-tayba-900/55 dark:text-paper-200/55">
        For offline access, in the next release Tasneem will bundle the 40 Hadith Nawawi and a curated Riyad as-Salihin subset with verified gradings.
      </p>
    </div>
  );
}
