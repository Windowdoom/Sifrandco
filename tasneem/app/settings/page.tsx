"use client";
import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/Brand";
import PrayerReminders from "@/components/PrayerReminders";
import { Storage } from "@/lib/storage";
import { CALCULATION_METHODS, DEFAULT_SETTINGS, type UserSettings } from "@/lib/prayer-times";

export default function Settings() {
  const [s, setS] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setS(Storage.load(Storage.KEYS.settings, DEFAULT_SETTINGS)); }, []);

  function save(next: UserSettings) {
    setS(next); Storage.save(Storage.KEYS.settings, next);
    setSaved(true); setTimeout(() => setSaved(false), 1200);
  }

  function exportData() {
    const json = Storage.exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `tasneem-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  function importData(file: File) {
    file.text().then((t) => { if (Storage.importAll(t)) location.reload(); else alert("Invalid backup file."); });
  }

  function clearLocation() {
    localStorage.removeItem(Storage.KEYS.location); location.reload();
  }

  return (
    <div className="px-4 pt-8 space-y-6">
      <SectionTitle kicker="Preferences" title="Settings" />

      <PrayerReminders />

      <div className="card p-5">
        <div className="text-sm font-medium mb-2">Calculation method</div>
        <select value={s.method} onChange={(e) => save({ ...s, method: e.target.value as any })}
          className="w-full rounded-xl border border-paper-200 bg-paper-50 px-3 py-2 text-sm dark:border-tayba-700 dark:bg-tayba-800">
          {CALCULATION_METHODS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <div className="mt-2 text-xs text-tayba-900/60 dark:text-paper-200/60">{CALCULATION_METHODS.find((m) => m.key === s.method)?.note}</div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-medium mb-2">Madhab (affects Asr time)</div>
        <div className="flex gap-2">
          {(["Shafi", "Hanafi"] as const).map((m) => (
            <button key={m} onClick={() => save({ ...s, madhab: m })}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm ${s.madhab === m ? "border-gold-400 bg-gold-50 text-tayba-700" : "border-paper-200"}`}>
              {m === "Shafi" ? "Shafi'i / Maliki / Hanbali" : "Hanafi"}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-tayba-900/60 dark:text-paper-200/60">
          Shafi: Asr when shadow = object length. Hanafi: Asr when shadow = 2× object length.
        </div>
      </div>

      <div className="card p-5">
        <div className="text-sm font-medium mb-3">High-latitude rule</div>
        <select value={s.highLatitudeRule ?? ""} onChange={(e) => save({ ...s, highLatitudeRule: (e.target.value || undefined) as any })}
          className="w-full rounded-xl border border-paper-200 bg-paper-50 px-3 py-2 text-sm dark:border-tayba-700 dark:bg-tayba-800">
          <option value="">Default for method</option>
          <option value="MiddleOfTheNight">Middle of the Night</option>
          <option value="SeventhOfTheNight">Seventh of the Night</option>
          <option value="TwilightAngle">Twilight Angle</option>
        </select>
      </div>

      <div className="card p-5 space-y-3">
        <div className="text-sm font-medium">Data</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData} className="btn-primary text-sm">Export backup (JSON)</button>
          <label className="btn-primary cursor-pointer text-sm">
            Import backup
            <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); }} />
          </label>
          <button onClick={clearLocation} className="rounded-full border border-paper-200 px-4 py-2 text-sm">Clear location</button>
        </div>
        <div className="text-xs text-tayba-900/60 dark:text-paper-200/60">
          All data stays on your device. Tasneem makes no network requests except to load Quran/Hadith content when you open those pages.
        </div>
      </div>

      {saved && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-tayba-700 px-4 py-2 text-xs text-paper-50">Saved</div>}
    </div>
  );
}
