"use client";
import { useState } from "react";
import { SectionTitle } from "@/components/Brand";
import { DUAS, type Mood } from "@/data/duas";

interface MoodConfig {
  id: Mood;
  label: string;
  arabic: string;
  reflection: string;
  ayah: { text: string; translation: string; reference: string; refUrl: string };
  dhikr: { arabic: string; transliteration: string; meaning: string; count: number };
  breath: string;
}

const MOODS: MoodConfig[] = [
  {
    id: "anxious",
    label: "Anxious",
    arabic: "قَلِق",
    reflection: "Anxiety is not weakness in iman. The Prophet ﷺ felt it; the Quran itself names it. What it asks of you is not silence, it asks you to turn.",
    ayah: {
      text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      translation: "Verily, in the remembrance of Allah do hearts find rest.",
      reference: "Quran 13:28",
      refUrl: "https://quran.com/13/28",
    },
    dhikr: {
      arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      transliteration: "Hasbuna-llahu wa ni'mal-wakil",
      meaning: "Allah is sufficient for us, and the best Disposer of affairs.",
      count: 7,
    },
    breath: "Slow breath in for four, hold for four, out for six. Three rounds. Then begin the dhikr.",
  },
  {
    id: "guilty",
    label: "Guilty",
    arabic: "نَادِم",
    reflection: "The door of return was made wider than the door of sin. The Prophet ﷺ said Allah's joy at His servant's repentance is greater than yours would be if you lost everything and then found it again.",
    ayah: {
      text: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
      translation: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah.",
      reference: "Quran 39:53",
      refUrl: "https://quran.com/39/53",
    },
    dhikr: {
      arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
      transliteration: "Astaghfiru-llaha wa atubu ilayh",
      meaning: "I seek Allah's forgiveness and I turn to Him in repentance.",
      count: 33,
    },
    breath: "Sit. Lower your gaze. Mean it once; do not perform it. Then say it again.",
  },
  {
    id: "lost",
    label: "Lost",
    arabic: "ضَائِع",
    reflection: "You are not asked to see the whole road. You are asked to take the next true step. Guidance is given to the one already walking.",
    ayah: {
      text: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
      translation: "And those who strive for Us, We will surely guide them to Our ways.",
      reference: "Quran 29:69",
      refUrl: "https://quran.com/29/69",
    },
    dhikr: {
      arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
      transliteration: "Allahumma-hdini wa saddidni",
      meaning: "O Allah, guide me and keep me firm.",
      count: 7,
    },
    breath: "Pray two rakats of istikhara, or just two rakats for clarity. Then walk forward, watching where doors open.",
  },
  {
    id: "exhausted",
    label: "Exhausted",
    arabic: "مُتْعَب",
    reflection: "Allah does not burden a soul beyond what it can carry. If you feel you cannot, the verse is saying you are not asked to.",
    ayah: {
      text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
      translation: "Allah does not burden a soul beyond that it can bear.",
      reference: "Quran 2:286",
      refUrl: "https://quran.com/2/286",
    },
    dhikr: {
      arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
      transliteration: "La hawla wa la quwwata illa billah",
      meaning: "There is no might nor power except with Allah.",
      count: 10,
    },
    breath: "Rest is worship when it returns you to worship. Sleep, eat, drink water. Begin again at the next adhan.",
  },
  {
    id: "grateful",
    label: "Grateful",
    arabic: "شَاكِر",
    reflection: "Gratitude expressed is gratitude doubled. The same verse that promises increase also warns the ungrateful, so naming the blessing is itself protection.",
    ayah: {
      text: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
      translation: "If you are grateful, I will surely give you more.",
      reference: "Quran 14:7",
      refUrl: "https://quran.com/14/7",
    },
    dhikr: {
      arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      transliteration: "Alhamdu lillahi Rabbi-l-'alamin",
      meaning: "All praise belongs to Allah, Lord of the worlds.",
      count: 33,
    },
    breath: "Name three blessings out loud right now. Big, small, embarrassingly small. Then say the dhikr.",
  },
  {
    id: "hopeful",
    label: "Hopeful",
    arabic: "رَاجٍ",
    reflection: "Hope in Allah is itself an act of worship. The Prophet ﷺ said: Allah is as His servant thinks of Him; so think well of Him.",
    ayah: {
      text: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ",
      translation: "And My mercy encompasses all things.",
      reference: "Quran 7:156",
      refUrl: "https://quran.com/7/156",
    },
    dhikr: {
      arabic: "يَا رَحْمَٰنُ يَا رَحِيمُ",
      transliteration: "Ya Rahmanu Ya Rahim",
      meaning: "O Most Merciful, O Especially Merciful.",
      count: 21,
    },
    breath: "Make the dua you have been afraid to ask for. He is not bothered by your asking. He is honoured by it.",
  },
  {
    id: "afraid",
    label: "Afraid",
    arabic: "خَائِف",
    reflection: "Fear is real, but it does not name the Real. Whatever you fear has no power except by Allah's leave, and He stands behind everything that stands.",
    ayah: {
      text: "إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ أَلَّا تَخَافُوا وَلَا تَحْزَنُوا",
      translation: "Those who say, Our Lord is Allah, and then remain steadfast, the angels descend upon them: Do not fear, nor grieve.",
      reference: "Quran 41:30",
      refUrl: "https://quran.com/41/30",
    },
    dhikr: {
      arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ",
      transliteration: "Hasbiya-llahu la ilaha illa huwa, 'alayhi tawakkaltu",
      meaning: "Allah is sufficient for me. There is no god except Him. Upon Him I rely.",
      count: 7,
    },
    breath: "Recite Surah al-Falaq and Surah an-Nas. Blow softly into your palms. Wipe them over yourself.",
  },
  {
    id: "rizq",
    label: "Need provision",
    arabic: "مُحْتَاج",
    reflection: "Provision is decreed, but movement is asked of you. Walk and ask; the bird leaves the nest empty and returns full.",
    ayah: {
      text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا، وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
      translation: "Whoever fears Allah, He will make for him a way out, and provide for him from where he does not expect.",
      reference: "Quran 65:2-3",
      refUrl: "https://quran.com/65/2",
    },
    dhikr: {
      arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
      transliteration: "Allahumma-kfini bi-halalika 'an haramik, wa aghnini bi-fadlika 'amman siwak",
      meaning: "O Allah, suffice me with what You have made lawful over what You have made unlawful, and enrich me by Your favour, free of need of anyone besides You.",
      count: 1,
    },
    breath: "Pay any sadaqah you can today, even a small one. The hadith says it does not decrease wealth, it cleanses it.",
  },
];

export default function Feel() {
  const [active, setActive] = useState<Mood | null>(null);
  const mood = MOODS.find((m) => m.id === active);

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="What's in your chest" title="Begin where you are" />

      <p className="-mt-2 mb-6 text-[0.9rem] leading-relaxed text-tayba-900/75 dark:text-paper-200/70">
        Choose what's closest to how you feel right now. You'll be given a verse, a dhikr, a small action,
        and a dua matched to that state. None of this is tracked or saved.
      </p>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`card flex flex-col items-start gap-1 p-3.5 text-left transition ${
              active === m.id ? "border-gold-400 shadow-gold" : "hover:border-gold-400/60"
            }`}>
            <span className="font-serif text-[1.05rem] font-medium text-tayba-900 dark:text-paper-50">{m.label}</span>
            <span className="arabic text-base text-gold-600">{m.arabic}</span>
          </button>
        ))}
      </div>

      {mood && (
        <section className="mt-6 space-y-4">
          <article className="card p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold-600">A short reflection</div>
            <p className="mt-2 font-serif text-[1.05rem] leading-relaxed text-tayba-900 dark:text-paper-50">
              {mood.reflection}
            </p>
          </article>

          <article className="card p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold-600">Ayah</div>
            <div className="arabic mt-2 text-[1.55rem] leading-[2.3] text-tayba-900 dark:text-paper-50">
              {mood.ayah.text}
            </div>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-tayba-900/85 dark:text-paper-200/85">
              {mood.ayah.translation}
            </p>
            <footer className="mt-3 flex items-center gap-3 border-t border-paper-200/70 pt-3 text-[11px] dark:border-tayba-700/60">
              <span className="rounded-full bg-gold-50 px-2 py-0.5 font-medium text-gold-700">Quran</span>
              <span className="text-tayba-900/65 dark:text-paper-200/60">{mood.ayah.reference}</span>
              <a href={mood.ayah.refUrl} target="_blank" rel="noopener noreferrer"
                 className="ml-auto text-gold-600 underline-offset-2 hover:underline">verify ↗</a>
            </footer>
          </article>

          <article className="card p-5">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.22em] text-gold-600">Dhikr</div>
              <span className="text-[11px] text-tayba-900/65 dark:text-paper-200/60">×{mood.dhikr.count}</span>
            </div>
            <div className="arabic mt-2 text-[1.45rem] leading-[2.2] text-tayba-900 dark:text-paper-50">
              {mood.dhikr.arabic}
            </div>
            <p className="mt-2 text-[0.88rem] italic leading-relaxed text-tayba-800/85 dark:text-paper-200/80">
              {mood.dhikr.transliteration}
            </p>
            <p className="mt-1.5 text-[0.92rem] leading-relaxed text-tayba-900/85 dark:text-paper-200/85">
              {mood.dhikr.meaning}
            </p>
          </article>

          <article className="card p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold-600">Small action</div>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-tayba-900/90 dark:text-paper-200/85">
              {mood.breath}
            </p>
          </article>

          <RelatedDuas moodId={mood.id} />
        </section>
      )}

      <p className="mt-10 text-center text-[11px] leading-relaxed text-tayba-900/55 dark:text-paper-200/55">
        Nothing here replaces a scholar or, when needed, a doctor. If your chest is heavy beyond what these
        words can hold, reach for both, the people of knowledge, and the people of medicine.
      </p>
    </div>
  );
}

function RelatedDuas({ moodId }: { moodId: Mood }) {
  const related = DUAS.filter((d) => d.moods?.includes(moodId)).slice(0, 3);
  if (!related.length) return null;
  return (
    <article className="card p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-gold-600">Related duas</div>
      <ul className="mt-2 space-y-2.5">
        {related.map((d) => (
          <li key={d.id} className="border-t border-paper-200/70 pt-2.5 first:border-0 first:pt-0 dark:border-tayba-700/60">
            <div className="font-serif text-[1rem] font-medium text-tayba-900 dark:text-paper-50">{d.title}</div>
            {d.context && (
              <p className="mt-0.5 text-[0.82rem] leading-relaxed text-tayba-900/70 dark:text-paper-200/65">
                {d.context}
              </p>
            )}
          </li>
        ))}
      </ul>
      <a href="/duas" className="mt-3 inline-block text-[12px] text-gold-600 underline-offset-2 hover:underline">
        Read these in full ↗
      </a>
    </article>
  );
}
