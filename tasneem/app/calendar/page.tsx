"use client";
import { useMemo, useState } from "react";
import { SectionTitle } from "@/components/Brand";
import { formatHijri, gregorianToHijri, islamicEventsForYear } from "@/lib/hijri";

export default function Calendar() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const start = first.getDay();
    const arr: { date: Date | null }[] = [];
    for (let i = 0; i < start; i++) arr.push({ date: null });
    for (let d = 1; d <= last.getDate(); d++) arr.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), d) });
    return arr;
  }, [cursor]);

  const hijriToday = gregorianToHijri(today);
  const events = islamicEventsForYear(hijriToday.year);

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Two calendars · One day" title="Hijri Calendar" />

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>←</button>
          <div className="text-center">
            <div className="font-serif text-xl">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
            <div className="text-xs text-gold-500">{formatHijri(gregorianToHijri(cursor))}</div>
          </div>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>→</button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-tayba-900/50 dark:text-paper-200/50">
          {["S","M","T","W","T","F","S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((cell, i) => {
            if (!cell.date) return <div key={i} className="aspect-square" />;
            const h = gregorianToHijri(cell.date);
            const isToday = cell.date.toDateString() === today.toDateString();
            const isFriday = cell.date.getDay() === 5;
            return (
              <div key={i} className={`aspect-square rounded-lg border p-1 text-left ${
                isToday ? "border-gold-400 bg-gold-50" :
                isFriday ? "border-tayba-200 bg-tayba-50/40" :
                "border-paper-200 dark:border-tayba-700"}`}>
                <div className="text-[11px] font-medium">{cell.date.getDate()}</div>
                <div className="text-[9px] text-gold-500">{h.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card mt-4 p-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-gold-500">Year {hijriToday.year} AH</div>
        <h3 className="font-serif text-lg mt-1">Key dates this year</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {events.map((e) => (
            <li key={e.name} className="flex justify-between border-b border-paper-200 py-1.5 last:border-0 dark:border-tayba-700">
              <span>{e.name}</span>
              <span className="text-tayba-900/60 dark:text-paper-200/60">{e.day} {["Muharram","Safar","Rabi' I","Rabi' II","Jumada I","Jumada II","Rajab","Sha'ban","Ramadan","Shawwal","Dhu al-Qi'dah","Dhu al-Hijjah"][e.month - 1]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-tayba-900/55 dark:text-paper-200/55">
          Dates are tabular (Umm al-Qura aligned). For fiqh purposes always confirm via local moonsighting.
        </p>
      </div>
    </div>
  );
}
