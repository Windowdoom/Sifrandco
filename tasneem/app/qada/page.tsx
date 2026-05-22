"use client";
import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/Brand";
import { Storage } from "@/lib/storage";

interface QadaState { fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number; witr: number; }
const ZERO: QadaState = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };

export default function Qada() {
  const [s, setS] = useState<QadaState>(ZERO);
  useEffect(() => { setS(Storage.load(Storage.KEYS.qada, ZERO)); }, []);
  useEffect(() => { Storage.save(Storage.KEYS.qada, s); }, [s]);

  const total = Object.values(s).reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Make-up prayers" title="Qada Tracker" />

      <div className="card p-5 text-center">
        <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">Outstanding</div>
        <div className="font-serif text-5xl mt-1">{total}</div>
        <div className="text-xs text-tayba-900/60 dark:text-paper-200/60 mt-1">salah remaining, by the will of Allah</div>
      </div>

      <div className="mt-4 space-y-2">
        {(Object.keys(s) as (keyof QadaState)[]).map((k) => (
          <div key={k} className="card flex items-center justify-between p-4">
            <div className="font-serif text-lg capitalize">{k}</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setS({ ...s, [k]: Math.max(0, s[k] - 1) })}
                className="grid h-9 w-9 place-items-center rounded-full border border-paper-200 dark:border-tayba-700">−</button>
              <input type="number" min={0} value={s[k]} onChange={(e) => setS({ ...s, [k]: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-16 rounded-xl border border-paper-200 bg-paper-50 px-2 py-1.5 text-center dark:border-tayba-700 dark:bg-tayba-800"/>
              <button onClick={() => setS({ ...s, [k]: s[k] + 1 })}
                className="grid h-9 w-9 place-items-center rounded-full bg-tayba-600 text-paper-50">+</button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[11px] text-tayba-900/55 dark:text-paper-200/55">
        Chip away with one or two qada with each daily prayer. The Prophet ﷺ said:
        <em> "Whoever forgets a prayer or sleeps through it, its expiation is to pray it when he remembers it."</em>, Sahih al-Bukhari 597 · <a href="https://sunnah.com/bukhari:597" target="_blank" rel="noopener" className="text-gold-500 underline">verify</a>
      </p>
    </div>
  );
}
