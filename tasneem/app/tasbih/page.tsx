"use client";
import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/Brand";
import { Storage } from "@/lib/storage";

interface TasbihState {
  presets: { id: string; label: string; arabic: string; target: number }[];
  activeId: string;
  count: number;
  loops: number;
}

const DEFAULT_STATE: TasbihState = {
  activeId: "subhan",
  count: 0,
  loops: 0,
  presets: [
    { id: "subhan",   label: "SubhanAllah",   arabic: "سُبْحَانَ اللَّهِ",  target: 33 },
    { id: "alhamd",   label: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ",  target: 33 },
    { id: "akbar",    label: "Allahu Akbar",  arabic: "اللَّهُ أَكْبَرُ",   target: 33 },
    { id: "lailaha",  label: "La ilaha illa-llah", arabic: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100 },
    { id: "istighfar",label: "Astaghfirullah",arabic: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
    { id: "salawat",  label: "Salawat",       arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100 },
  ],
};

export default function Tasbih() {
  const [state, setState] = useState<TasbihState>(DEFAULT_STATE);

  useEffect(() => { setState(Storage.load(Storage.KEYS.tasbih, DEFAULT_STATE)); }, []);
  useEffect(() => { Storage.save(Storage.KEYS.tasbih, state); }, [state]);

  const active = state.presets.find((p) => p.id === state.activeId)!;
  const pct = Math.min(100, (state.count / active.target) * 100);

  function tick() {
    const next = state.count + 1;
    if (navigator.vibrate) navigator.vibrate(10);
    if (next >= active.target) {
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      setState({ ...state, count: 0, loops: state.loops + 1 });
    } else {
      setState({ ...state, count: next });
    }
  }

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Dhikr" title="Tasbih" />

      <div className="card p-5 text-center">
        <div className="arabic text-3xl text-tayba-700 dark:text-paper-50">{active.arabic}</div>
        <div className="mt-1 text-sm text-tayba-900/60 dark:text-paper-200/60">{active.label}</div>

        <button onClick={tick}
          className="relative mx-auto mt-6 grid h-56 w-56 place-items-center rounded-full bg-tasneem-radial text-paper-50 shadow-soft active:scale-[0.98] transition">
          <svg className="absolute inset-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none"/>
            <circle cx="50" cy="50" r="46" stroke="#C9A961" strokeWidth="3" fill="none"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - pct / 100)}
              strokeLinecap="round" transform="rotate(-90 50 50)"/>
          </svg>
          <div>
            <div className="font-serif text-6xl">{state.count}</div>
            <div className="text-[11px] uppercase tracking-widest text-paper-50/60">of {active.target}</div>
          </div>
        </button>

        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <div className="text-tayba-900/60 dark:text-paper-200/60">Loops: <span className="font-medium text-gold-500">{state.loops}</span></div>
          <button onClick={() => setState({ ...state, count: 0 })} className="text-xs underline">Reset count</button>
          <button onClick={() => setState({ ...state, count: 0, loops: 0 })} className="text-xs underline">Reset all</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {state.presets.map((p) => (
          <button key={p.id} onClick={() => setState({ ...state, activeId: p.id, count: 0 })}
            className={`card p-3 text-left transition ${state.activeId === p.id ? "ring-1 ring-gold-400" : "hover:border-gold-400"}`}>
            <div className="arabic text-lg text-tayba-700 dark:text-paper-50">{p.arabic}</div>
            <div className="text-xs text-tayba-900/60 dark:text-paper-200/60">{p.label} · ×{p.target}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
