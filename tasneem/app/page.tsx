"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LocationGate from "@/components/LocationGate";
import { Wordmark } from "@/components/Brand";
import { Storage } from "@/lib/storage";
import { DEFAULT_SETTINGS, type UserSettings, computePrayerTimes, fmtCountdown, fmtTime, slotsFromTimes } from "@/lib/prayer-times";
import { formatHijri, gregorianToHijri } from "@/lib/hijri";

export default function Home() {
  return (
    <LocationGate>
      {(loc) => <Dashboard lat={loc.lat} lng={loc.lng} label={loc.label} />}
    </LocationGate>
  );
}

function Dashboard({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  const [now, setNow] = useState(() => new Date());
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(Storage.load(Storage.KEYS.settings, DEFAULT_SETTINGS));
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const slots = useMemo(() => {
    const t = computePrayerTimes(lat, lng, now, settings);
    return slotsFromTimes(t, now);
  }, [lat, lng, now, settings]);

  const next = slots.find((s) => s.isNext) ?? slots[0];
  const current = slots.find((s) => s.isCurrent);
  const hijri = formatHijri(gregorianToHijri(now));

  return (
    <div className="pt-8 pb-6">
      <header className="px-6">
        <Wordmark subtitle="A spring from which those near Allah drink, Q 83:27" />
      </header>

      {/* Next prayer hero */}
      <section className="relative mx-4 mt-6 overflow-hidden rounded-3xl bg-tasneem-radial p-6 text-paper-50 shadow-soft geo-pattern">
        <div className="relative z-10">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-paper-50/70">
            <span>{label ?? "Your location"}</span>
            <span>{hijri}</span>
          </div>

          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.25em] text-gold-300">Next prayer</div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-serif text-4xl text-paper-50">{next.label}</span>
              <span className="text-paper-50/80">{fmtTime(next.time)}</span>
            </div>
            <div className="mt-1 text-sm text-gold-300/90">
              in {fmtCountdown(next.time.getTime())}
            </div>
          </div>

          <div className="gold-rule my-5" />

          <div className="grid grid-cols-3 gap-2 text-center">
            {slots.filter((s) => s.key !== "sunrise").map((s) => (
              <div key={s.key} className={`rounded-xl px-2 py-2.5 ${
                s.isNext ? "bg-gold-400/20 ring-1 ring-gold-400/60"
                : s.isCurrent ? "bg-paper-50/10" : "bg-paper-50/5"}`}>
                <div className="text-[10px] uppercase tracking-wider text-paper-50/60">{s.label}</div>
                <div className="text-sm font-medium text-paper-50">{fmtTime(s.time)}</div>
              </div>
            ))}
          </div>

          {current && (
            <div className="mt-4 text-center text-[11px] text-paper-50/70">
              Current window, <span className="text-gold-300">{current.label}</span>
            </div>
          )}
        </div>
      </section>

      {/* Begin where you are - emotional state guidance */}
      <section className="mx-4 mt-5">
        <Link href="/feel" className="card relative flex items-center justify-between gap-4 overflow-hidden p-4 transition hover:border-gold-400 hover:shadow-gold">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold-600">Begin where you are</div>
            <div className="mt-1 font-serif text-[1.15rem] font-medium text-tayba-900 dark:text-paper-50">
              Anxious, lost, grateful, tired?
            </div>
            <div className="mt-0.5 text-[0.82rem] text-tayba-900/75 dark:text-paper-200/70">
              A verse, a dhikr, and a small action, matched to how you feel.
            </div>
          </div>
          <div className="arabic shrink-0 text-2xl text-gold-600">قَلْب</div>
        </Link>
      </section>

      {/* Quick tiles */}
      <section className="mx-4 mt-4 grid grid-cols-2 gap-2.5">
        <Tile href="/qibla"  title="Qibla"       sub="Direction & distance" />
        <Tile href="/tasbih" title="Tasbih"      sub="Dhikr counter" />
        <Tile href="/quran"  title="Quran"       sub="Read & listen" />
        <Tile href="/duas"   title="Duas"        sub="Morning, Evening" />
        <Tile href="/names"  title="99 Names"    sub="Asma' al-Husna" />
        <Tile href="/hadith" title="Hadith"      sub="The Six Books" />
        <Tile href="/calendar" title="Hijri Calendar" sub="Events & fasts" />
        <Tile href="/zakat"  title="Zakat"       sub="Nisab calculator" />
        <Tile href="/qada"   title="Qada Tracker" sub="Make-up prayers" />
        <Tile href="/ramadan" title="Ramadan"    sub="Suhoor & Iftar" />
      </section>

      {/* Footer pill */}
      <section className="mx-4 mt-6 mb-4 flex items-center justify-between rounded-2xl border border-paper-200 bg-white px-4 py-3 dark:border-tayba-700 dark:bg-tayba-800">
        <div className="text-xs font-medium text-tayba-900/85 dark:text-paper-200/70">
          No ads, no tracking, open source
        </div>
        <Link href="/donate" className="btn-gold text-sm">Support Tasneem</Link>
      </section>

      <div className="mx-4 text-center text-[10px] tracking-wider text-tayba-900/40 dark:text-paper-200/40">
        صَلِّ اللَّهُمَّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ
      </div>
    </div>
  );
}

function Tile({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <Link href={href} className="card group p-3.5 transition hover:border-gold-400 hover:shadow-gold">
      <div className="font-serif text-[1.05rem] font-medium text-tayba-900 dark:text-paper-50">{title}</div>
      <div className="mt-0.5 text-[0.78rem] text-tayba-900/75 dark:text-paper-200/70">{sub}</div>
      <div className="mt-2.5 h-px w-8 bg-gold-400 transition-all group-hover:w-16" />
    </Link>
  );
}
