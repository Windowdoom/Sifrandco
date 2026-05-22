// Local-only prayer-time notifications.
// No backend, no push server, no telemetry.
// Limitation: notifications only fire while a Tasneem tab is open in this browser.
// Add Tasneem to your home screen and keep it as the foreground tab for the day
// to get every adhan reminder. Closing all tabs cancels the scheduled timers.

import { computePrayerTimes, type UserSettings } from "./prayer-times";

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
type PrayerKey = (typeof PRAYER_ORDER)[number];

const PRAYER_LABEL: Record<PrayerKey, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

let timers: number[] = [];

export function clearScheduled() {
  timers.forEach((id) => window.clearTimeout(id));
  timers = [];
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

function ask(title: string, body: string, tag: string) {
  // Prefer the service worker so notifications survive a brief tab background.
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "tasneem-notify", title, body, tag });
    return;
  }
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, tag, icon: "/icon.svg" });
  }
}

interface ScheduleArgs {
  lat: number;
  lng: number;
  settings: UserSettings;
  preReminderMinutes?: number; // 0 disables the warning, default 10
}

export function scheduleToday({ lat, lng, settings, preReminderMinutes = 10 }: ScheduleArgs) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  clearScheduled();
  const now = new Date();
  const times = computePrayerTimes(lat, lng, now, settings);

  for (const key of PRAYER_ORDER) {
    const at = times[key] as Date | undefined;
    if (!(at instanceof Date)) continue;
    const ms = at.getTime() - now.getTime();
    const label = PRAYER_LABEL[key];

    if (preReminderMinutes > 0) {
      const warnMs = ms - preReminderMinutes * 60_000;
      if (warnMs > 0) {
        timers.push(window.setTimeout(() => {
          ask(`${label} in ${preReminderMinutes} minutes`, "A small reminder, when you're ready.", `tasneem-${key}-warn`);
        }, warnMs));
      }
    }

    if (ms > 0) {
      timers.push(window.setTimeout(() => {
        ask(`${label} time`, "Allahu akbar. May your prayer be accepted.", `tasneem-${key}`);
      }, ms));
    }
  }

  // Reschedule at midnight so tomorrow's prayers get queued.
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 5, 0);
  const untilMidnight = tomorrow.getTime() - now.getTime();
  timers.push(window.setTimeout(() => {
    scheduleToday({ lat, lng, settings, preReminderMinutes });
  }, untilMidnight));
}

export function isSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function currentPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}
