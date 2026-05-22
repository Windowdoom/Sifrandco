"use client";
import { useEffect, useMemo, useState } from "react";
import LocationGate from "@/components/LocationGate";
import { SectionTitle } from "@/components/Brand";
import { Storage } from "@/lib/storage";
import { computePrayerTimes, DEFAULT_SETTINGS, fmtCountdown, fmtTime, type UserSettings } from "@/lib/prayer-times";
import { gregorianToHijri } from "@/lib/hijri";

export default function Ramadan() {
  return <LocationGate>{(loc) => <Inner lat={loc.lat} lng={loc.lng} />}</LocationGate>;
}

function Inner({ lat, lng }: { lat: number; lng: number }) {
  const [now, setNow] = useState(new Date());
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  useEffect(() => { setSettings(Storage.load(Storage.KEYS.settings, DEFAULT_SETTINGS)); const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  const times = useMemo(() => computePrayerTimes(lat, lng, now, settings), [lat, lng, now, settings]);
  const hijri = gregorianToHijri(now);
  const inRamadan = hijri.month === 9;
  const lastTen = inRamadan && hijri.day >= 21;
  const isOddNight = lastTen && hijri.day % 2 === 1;

  // Suhoor ends at Fajr; Iftar at Maghrib.
  const target = now < times.fajr ? { label: "Suhoor ends (Fajr)", t: times.fajr } :
                 now < times.maghrib ? { label: "Iftar (Maghrib)", t: times.maghrib } :
                 { label: "Tomorrow's Fajr", t: new Date(times.fajr.getTime() + 86_400_000) };

  return (
    <div className="px-4 pt-8 space-y-4">
      <SectionTitle kicker={`${hijri.day} ${hijri.monthName}`} title={inRamadan ? "Ramadan Mubarak" : "Ramadan"} />

      <div className="relative card p-6 text-center geo-pattern overflow-hidden">
        <div className="relative z-10">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">{target.label}</div>
          <div className="font-serif text-5xl mt-1 text-tayba-700 dark:text-paper-50">{fmtCountdown(target.t.getTime())}</div>
          <div className="text-sm text-tayba-900/60 dark:text-paper-200/60 mt-1">at {fmtTime(target.t)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">Suhoor ends</div>
          <div className="font-serif text-2xl mt-1">{fmtTime(times.fajr)}</div>
          <div className="text-xs text-tayba-900/60">Fajr — stop eating</div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">Iftar</div>
          <div className="font-serif text-2xl mt-1">{fmtTime(times.maghrib)}</div>
          <div className="text-xs text-tayba-900/60">Maghrib — break fast</div>
        </div>
      </div>

      {lastTen && (
        <div className="card p-5 border border-gold-400/60">
          <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">The last ten nights</div>
          <h3 className="font-serif text-xl mt-1">Laylat al-Qadr {isOddNight ? "— odd night tonight" : ""}</h3>
          <p className="text-sm mt-2 text-tayba-900/75 dark:text-paper-200/75">
            <em>"Seek Laylat al-Qadr in the odd nights of the last ten of Ramadan."</em> — Sahih al-Bukhari 2017 · <a target="_blank" rel="noopener" href="https://sunnah.com/bukhari:2017" className="text-gold-500 underline">verify</a>
          </p>
          <div className="mt-3 rounded-xl bg-gold-50 p-3 text-sm dark:bg-gold-500/10">
            <div className="text-[10px] uppercase tracking-widest text-gold-500">Dua for Laylat al-Qadr</div>
            <div className="arabic text-2xl mt-1 text-tayba-700 dark:text-paper-50">اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي</div>
            <div className="text-xs mt-1 text-tayba-900/70 dark:text-paper-200/70">
              "O Allah, You are Pardoning and You love to pardon, so pardon me." — Tirmidhi 3513 · <a target="_blank" rel="noopener" href="https://sunnah.com/tirmidhi:3513" className="text-gold-500 underline">verify</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
