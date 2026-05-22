"use client";
import { useEffect, useMemo, useState } from "react";
import LocationGate from "@/components/LocationGate";
import { SectionTitle } from "@/components/Brand";
import { Storage } from "@/lib/storage";
import { CALCULATION_METHODS, DEFAULT_SETTINGS, computePrayerTimes, fmtTime, slotsFromTimes, type UserSettings } from "@/lib/prayer-times";
import { formatHijri, gregorianToHijri } from "@/lib/hijri";

export default function Prayer() {
  return <LocationGate>{(loc) => <Inner lat={loc.lat} lng={loc.lng} label={loc.label} />}</LocationGate>;
}

function Inner({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  const [offset, setOffset] = useState(0); // days from today
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => { setSettings(Storage.load(Storage.KEYS.settings, DEFAULT_SETTINGS)); }, []);

  const target = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + offset); return d;
  }, [offset]);

  const slots = useMemo(() => slotsFromTimes(computePrayerTimes(lat, lng, target, settings), target), [lat, lng, target, settings]);
  const hijri = formatHijri(gregorianToHijri(target));

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Mawaqit · The Five" title="Prayer Times" />

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-paper-200 bg-paper-50 p-3 text-sm dark:border-tayba-700 dark:bg-tayba-800">
        <button onClick={() => setOffset(offset - 1)} className="px-2">←</button>
        <div className="text-center">
          <div className="font-medium">{target.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</div>
          <div className="text-xs text-tayba-900/60 dark:text-paper-200/60">{hijri} · {label ?? `${lat.toFixed(3)}, ${lng.toFixed(3)}`}</div>
        </div>
        <button onClick={() => setOffset(offset + 1)} className="px-2">→</button>
      </div>

      <div className="card divide-y divide-paper-200 dark:divide-tayba-700">
        {slots.map((s) => (
          <div key={s.key} className={`flex items-center justify-between px-5 py-4 ${s.isNext ? "bg-gold-50 dark:bg-gold-500/10" : ""}`}>
            <div>
              <div className="font-serif text-lg text-tayba-700 dark:text-paper-50">{s.label}</div>
              {s.isNext && <div className="text-[10px] uppercase tracking-widest text-gold-500">Next</div>}
              {s.isCurrent && !s.isNext && <div className="text-[10px] uppercase tracking-widest text-tayba-500">Current</div>}
            </div>
            <div className="font-medium text-tayba-700 dark:text-paper-50">{fmtTime(s.time)}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 card p-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">Calculation</div>
        <div className="mt-1 font-medium">{CALCULATION_METHODS.find((m) => m.key === settings.method)?.label}</div>
        <div className="mt-1 text-xs text-tayba-900/60 dark:text-paper-200/60">{CALCULATION_METHODS.find((m) => m.key === settings.method)?.note}</div>
        <div className="mt-2 text-xs">Madhab for Asr: <span className="font-medium">{settings.madhab}</span></div>
        <a href="/settings" className="mt-3 inline-block text-xs text-gold-500 underline">Change method or madhab →</a>
      </div>
    </div>
  );
}
