"use client";
import { useEffect, useState } from "react";
import { Storage } from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/prayer-times";
import {
  clearScheduled,
  currentPermission,
  isSupported,
  requestPermission,
  scheduleToday,
} from "@/lib/notifications";

const PREF_KEY = "tasneem.notify.v1";

interface NotifyPrefs {
  enabled: boolean;
  preMinutes: number;
}

const DEFAULT_PREFS: NotifyPrefs = { enabled: false, preMinutes: 10 };

export default function PrayerReminders() {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const [prefs, setPrefs] = useState<NotifyPrefs>(DEFAULT_PREFS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPerm(currentPermission());
    setPrefs(Storage.load(PREF_KEY, DEFAULT_PREFS));
  }, []);

  useEffect(() => {
    if (!prefs.enabled || perm !== "granted") return;
    const loc = Storage.load<{ lat: number; lng: number } | null>(Storage.KEYS.location, null);
    if (!loc) return;
    const settings = Storage.load(Storage.KEYS.settings, DEFAULT_SETTINGS);
    scheduleToday({ lat: loc.lat, lng: loc.lng, settings, preReminderMinutes: prefs.preMinutes });
    return clearScheduled;
  }, [prefs.enabled, prefs.preMinutes, perm]);

  const update = (next: NotifyPrefs) => {
    setPrefs(next);
    Storage.save(PREF_KEY, next);
  };

  const toggle = async () => {
    if (prefs.enabled) {
      update({ ...prefs, enabled: false });
      clearScheduled();
      return;
    }
    setBusy(true);
    const result = await requestPermission();
    setPerm(result);
    setBusy(false);
    if (result === "granted") update({ ...prefs, enabled: true });
  };

  if (!isSupported() || perm === "unsupported") {
    return (
      <div className="card p-4 text-[0.85rem] text-tayba-900/70 dark:text-paper-200/70">
        Prayer reminders need a browser with the Notifications API. On iPhone, open Tasneem in Safari and
        Add to Home Screen, then enable from there.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-[1.1rem] font-medium text-tayba-900 dark:text-paper-50">
            Prayer reminders
          </h3>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-tayba-900/70 dark:text-paper-200/70">
            A gentle notification at each prayer, with an optional warning a few minutes before.
            Nothing leaves this device, no account, no push server.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={busy || perm === "denied"}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
            prefs.enabled
              ? "border-tayba-600 bg-tayba-600 text-paper-50 hover:bg-tayba-700"
              : "border-paper-200 text-tayba-900 hover:border-gold-400 dark:border-tayba-700 dark:text-paper-50"
          } disabled:opacity-60`}>
          {busy ? "…" : prefs.enabled ? "On" : "Turn on"}
        </button>
      </div>

      {perm === "denied" && (
        <p className="mt-2 text-[0.78rem] text-red-700 dark:text-red-300">
          Notifications are blocked in this browser. Re-enable them in site settings to use this.
        </p>
      )}

      {prefs.enabled && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[0.78rem] text-tayba-900/70 dark:text-paper-200/70">Warn me</span>
          {[0, 5, 10, 15].map((m) => (
            <button
              key={m}
              onClick={() => update({ ...prefs, preMinutes: m })}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                prefs.preMinutes === m
                  ? "border-gold-400 bg-gold-50 font-medium text-tayba-900"
                  : "border-paper-200 text-tayba-900/75 hover:border-gold-400/60 dark:border-tayba-700 dark:text-paper-200/70"
              }`}>
              {m === 0 ? "Only at time" : `${m} min before`}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-[0.72rem] leading-relaxed text-tayba-900/55 dark:text-paper-200/55">
        Honesty note, browsers only allow notifications to fire while Tasneem is open in a tab or installed
        to your home screen and still running. If you close every tab, the timers stop.
      </p>
    </div>
  );
}
