"use client";
import { useEffect, useMemo, useState } from "react";
import { SectionTitle } from "@/components/Brand";
import { Storage } from "@/lib/storage";

const STORAGE_KEY = "tasneem.prayerlog.v2";
const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const PRAYER_LABELS: Record<typeof PRAYERS[number], string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

type PrayerKey = typeof PRAYERS[number];

interface Log {
  // map of "YYYY-MM-DD:prayer" to a status code
  // 1 = on time, 2 = late/qada, 0 / missing = not marked
  [key: string]: 0 | 1 | 2;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeek(d: Date): Date {
  // Week starts Monday (works regardless of locale).
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = Monday
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default function PrayerGridPage() {
  const [log, setLog] = useState<Log>({});
  const [cursor, setCursor] = useState<Date>(() => startOfWeek(new Date()));
  const [today] = useState<Date>(() => new Date());
  const [todayKey] = useState(() => isoDate(today));

  useEffect(() => {
    setLog(Storage.load<Log>(STORAGE_KEY, {} as Log));
  }, []);

  const week = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(cursor, i)), [cursor]);

  const cycle = (date: Date, prayer: PrayerKey) => {
    if (date.getTime() > today.getTime()) return; // can't mark the future
    const key = `${isoDate(date)}:${prayer}`;
    const current = log[key] ?? 0;
    const next: 0 | 1 | 2 = current === 0 ? 1 : current === 1 ? 2 : 0;
    const updated = { ...log, [key]: next };
    if (next === 0) delete updated[key];
    setLog(updated);
    Storage.save(STORAGE_KEY, updated);
  };

  const weekStats = useMemo(() => {
    let onTime = 0, late = 0, total = 0;
    for (const d of week) {
      if (d.getTime() > today.getTime()) continue;
      for (const p of PRAYERS) {
        const v = log[`${isoDate(d)}:${p}`] ?? 0;
        total++;
        if (v === 1) onTime++;
        else if (v === 2) late++;
      }
    }
    return { onTime, late, total, missed: total - onTime - late };
  }, [week, log, today]);

  const weekLabel = `${cursor.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${addDays(cursor, 6).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  const isThisWeek = isoDate(startOfWeek(today)) === isoDate(cursor);

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Salah log" title="This week" />

      <p className="-mt-2 mb-5 text-[0.88rem] leading-relaxed text-tayba-900/75 dark:text-paper-200/70">
        Tap each prayer to mark it. One tap, on time. Two taps, prayed late or as qada. Three taps clears it.
        Logged on this device only, never sent anywhere.
      </p>

      <div className="card mb-4 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCursor(addDays(cursor, -7))}
            className="rounded-full border border-paper-200 px-3 py-1 text-xs text-tayba-900 hover:border-gold-400 dark:border-tayba-700 dark:text-paper-50">
            ← Prev
          </button>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold-600">{isThisWeek ? "This week" : "Week of"}</div>
            <div className="font-serif text-[1.05rem] font-medium text-tayba-900 dark:text-paper-50">{weekLabel}</div>
          </div>
          <button
            onClick={() => setCursor(addDays(cursor, 7))}
            disabled={addDays(cursor, 7).getTime() > today.getTime()}
            className="rounded-full border border-paper-200 px-3 py-1 text-xs text-tayba-900 hover:border-gold-400 disabled:opacity-30 dark:border-tayba-700 dark:text-paper-50">
            Next →
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-center text-[11px]">
            <thead>
              <tr className="text-tayba-900/65 dark:text-paper-200/60">
                <th className="py-1.5 pr-1 text-left text-[10px] uppercase tracking-wider">Prayer</th>
                {week.map((d, i) => {
                  const isToday = isoDate(d) === todayKey;
                  const isFuture = d.getTime() > today.getTime();
                  return (
                    <th key={i} className={`py-1.5 font-normal ${isFuture ? "opacity-40" : ""}`}>
                      <div className={`${isToday ? "text-gold-700 font-medium" : ""}`}>
                        {d.toLocaleDateString(undefined, { weekday: "short" })[0]}
                      </div>
                      <div className={`text-[10px] ${isToday ? "text-gold-700" : "text-tayba-900/50 dark:text-paper-200/50"}`}>
                        {d.getDate()}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PRAYERS.map((p) => (
                <tr key={p}>
                  <td className="py-1.5 pr-1 text-left text-[11px] font-medium text-tayba-900/80 dark:text-paper-200/80">
                    {PRAYER_LABELS[p]}
                  </td>
                  {week.map((d, i) => {
                    const key = `${isoDate(d)}:${p}`;
                    const v = log[key] ?? 0;
                    const isFuture = d.getTime() > today.getTime();
                    return (
                      <td key={i} className="px-0.5 py-1">
                        <button
                          aria-label={`${PRAYER_LABELS[p]} on ${d.toDateString()}`}
                          onClick={() => cycle(d, p)}
                          disabled={isFuture}
                          className={`mx-auto block h-7 w-7 rounded-md border transition disabled:opacity-25 ${
                            v === 1
                              ? "border-tayba-600 bg-tayba-600 text-paper-50"
                              : v === 2
                              ? "border-gold-400 bg-gold-50 text-gold-700"
                              : "border-paper-200 hover:border-gold-400 dark:border-tayba-700"
                          }`}>
                          {v === 1 ? "✓" : v === 2 ? "·" : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="On time" value={weekStats.onTime} tone="good" />
        <Stat label="Late / qada" value={weekStats.late} tone="gold" />
        <Stat label="Missed" value={weekStats.missed} tone="muted" />
      </div>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-tayba-900/55 dark:text-paper-200/55">
        No streaks, no notifications shaming you. The log is here to look at honestly, that's all.
        Allah is the One who accepts; this only tracks what you mark.
      </p>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "good" | "gold" | "muted" }) {
  return (
    <div className={`rounded-2xl border p-3 ${
      tone === "good" ? "border-tayba-200 bg-tayba-50/60"
      : tone === "gold" ? "border-gold-400/40 bg-gold-50/60"
      : "border-paper-200 bg-paper-50"
    } dark:border-tayba-700 dark:bg-tayba-800/40`}>
      <div className="font-serif text-[1.6rem] font-medium text-tayba-900 dark:text-paper-50">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-tayba-900/65 dark:text-paper-200/60">
        {label}
      </div>
    </div>
  );
}
