import Link from "next/link";
import { SectionTitle } from "@/components/Brand";

export const metadata = { title: "About · Tasneem" };

export default function About() {
  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Why this exists" title="About Tasneem" />

      <article className="prose-tasneem space-y-5 text-[0.95rem] leading-relaxed text-tayba-900/85 dark:text-paper-200/85">
        <p>
          Tasneem is named after a verse: <em>"And its mixture is of Tasneem, a spring from which those near
          to Allah drink."</em> <span className="text-tayba-900/65">(Quran 83:27)</span>
        </p>

        <p>
          It exists because most Islamic apps have stopped feeling Islamic. They have ads next to the adhan,
          they harvest location and selling-history data, they paywall the Quran, they push manipulative
          streaks the way social apps do. The Muslim Pro situation was a warning. Tasneem is the opposite
          of that warning: a worship companion that holds no data, asks for no account, sells no surface
          for anyone to advertise on, and never will.
        </p>

        <p>
          Everything in Tasneem is checked against the Quran and the Six Books of Hadith. Every dua shows
          its source and grading. Every hadith link goes to <a href="https://sunnah.com" className="text-gold-700 underline" target="_blank" rel="noopener noreferrer">sunnah.com</a> so
          you can verify it yourself. No da'if or fabricated narrations. No date-specific celebrations the
          Prophet ﷺ and the Sahaba did not mark. No content that depends on a scholar we can't credit.
        </p>

        <h3 className="font-serif text-[1.2rem] font-medium text-tayba-900 dark:text-paper-50">What lives on this device only</h3>
        <ul className="list-inside list-disc space-y-1.5 text-[0.9rem] text-tayba-900/80 dark:text-paper-200/75">
          <li>Your location (used to compute prayer times and qibla, never transmitted by Tasneem)</li>
          <li>Your calculation method and madhab preference</li>
          <li>Your tasbih counts and any qada you log</li>
          <li>Notification preferences</li>
        </ul>
        <p className="text-[0.85rem] text-tayba-900/70 dark:text-paper-200/70">
          Nothing here lives on a Tasneem server because Tasneem has no server. Static files only. The
          map queries (mosques, city search) hit OpenStreetMap directly without an API key.
        </p>

        <h3 className="font-serif text-[1.2rem] font-medium text-tayba-900 dark:text-paper-50">If you want to support it</h3>
        <p>
          Tasneem will never have ads, premium tiers, or accounts. If it helps you, the most useful things
          you can do are:
        </p>
        <ul className="list-inside list-disc space-y-1.5 text-[0.9rem] text-tayba-900/80 dark:text-paper-200/75">
          <li>Tell someone who would benefit</li>
          <li>Make dua for the people who built it and for everyone who uses it</li>
          <li>If you have spare sadaqah, the <Link href="/donate" className="text-gold-700 underline">donate page</Link> covers domain and infrastructure cost</li>
          <li>Open source contributions are welcome on the repository</li>
        </ul>

        <h3 className="font-serif text-[1.2rem] font-medium text-tayba-900 dark:text-paper-50">A standing disclaimer</h3>
        <p className="text-[0.9rem] text-tayba-900/80 dark:text-paper-200/75">
          Tasneem is a tool, not a scholar. For matters of fiqh, ask the people of knowledge. For matters
          of health, ask the people of medicine. For matters of the soul, ask Allah first.
        </p>
      </article>

      <p className="mt-10 text-center text-[11px] text-tayba-900/55 dark:text-paper-200/55">
        صَلِّ اللَّهُمَّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ
      </p>
    </div>
  );
}
