import { Coordinates, CalculationMethod, PrayerTimes, Madhab, HighLatitudeRule } from "adhan";

export type MethodKey =
  | "MuslimWorldLeague" | "Egyptian" | "Karachi" | "UmmAlQura" | "Dubai"
  | "MoonsightingCommittee" | "NorthAmerica" | "Kuwait" | "Qatar" | "Singapore" | "Tehran" | "Turkey";

export type MadhabKey = "Shafi" | "Hanafi";

export interface UserSettings {
  method: MethodKey;
  madhab: MadhabKey;
  highLatitudeRule?: "MiddleOfTheNight" | "SeventhOfTheNight" | "TwilightAngle";
  adjustments?: { fajr?: number; dhuhr?: number; asr?: number; maghrib?: number; isha?: number };
}

export const DEFAULT_SETTINGS: UserSettings = {
  method: "MuslimWorldLeague",
  madhab: "Shafi",
};

export const CALCULATION_METHODS: { key: MethodKey; label: string; note: string }[] = [
  { key: "MuslimWorldLeague",    label: "Muslim World League",      note: "Fajr 18°, Isha 17°, widely used worldwide" },
  { key: "Egyptian",             label: "Egyptian General Authority", note: "Fajr 19.5°, Isha 17.5°" },
  { key: "Karachi",              label: "University of Islamic Sciences, Karachi", note: "Fajr 18°, Isha 18°, South Asia" },
  { key: "UmmAlQura",            label: "Umm al-Qura, Makkah",      note: "Fajr 18.5°, Isha 90 min after Maghrib" },
  { key: "Dubai",                label: "Dubai",                    note: "Fajr 18.2°, Isha 18.2°" },
  { key: "MoonsightingCommittee",label: "Moonsighting Committee",   note: "Fajr 18°, Isha 18°, seasonal adjustments" },
  { key: "NorthAmerica",         label: "ISNA (North America)",     note: "Fajr 15°, Isha 15°" },
  { key: "Kuwait",               label: "Kuwait",                   note: "Fajr 18°, Isha 17.5°" },
  { key: "Qatar",                label: "Qatar",                    note: "Fajr 18°, Isha 90 min after Maghrib" },
  { key: "Singapore",            label: "Singapore",                note: "Fajr 20°, Isha 18°" },
  { key: "Tehran",               label: "Tehran",                   note: "Fajr 17.7°, Maghrib 4.5°, Isha 14°" },
  { key: "Turkey",               label: "Turkey (Diyanet)",         note: "Fajr 18°, Isha 17°" },
];

function methodParams(key: MethodKey) {
  switch (key) {
    case "MuslimWorldLeague":     return CalculationMethod.MuslimWorldLeague();
    case "Egyptian":              return CalculationMethod.Egyptian();
    case "Karachi":               return CalculationMethod.Karachi();
    case "UmmAlQura":             return CalculationMethod.UmmAlQura();
    case "Dubai":                 return CalculationMethod.Dubai();
    case "MoonsightingCommittee": return CalculationMethod.MoonsightingCommittee();
    case "NorthAmerica":          return CalculationMethod.NorthAmerica();
    case "Kuwait":                return CalculationMethod.Kuwait();
    case "Qatar":                 return CalculationMethod.Qatar();
    case "Singapore":             return CalculationMethod.Singapore();
    case "Tehran":                return CalculationMethod.Tehran();
    case "Turkey":                return CalculationMethod.Turkey();
  }
}

export function computePrayerTimes(
  lat: number, lng: number, date: Date, settings: UserSettings
): PrayerTimes {
  const coords = new Coordinates(lat, lng);
  const params = methodParams(settings.method);
  params.madhab = settings.madhab === "Hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  if (settings.highLatitudeRule === "MiddleOfTheNight") params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  if (settings.highLatitudeRule === "SeventhOfTheNight") params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  if (settings.highLatitudeRule === "TwilightAngle") params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
  if (settings.adjustments) {
    params.adjustments = {
      fajr: settings.adjustments.fajr ?? 0,
      dhuhr: settings.adjustments.dhuhr ?? 0,
      asr: settings.adjustments.asr ?? 0,
      maghrib: settings.adjustments.maghrib ?? 0,
      isha: settings.adjustments.isha ?? 0,
      sunrise: 0,
    };
  }
  return new PrayerTimes(coords, date, params);
}

export interface PrayerSlot { key: "fajr"|"sunrise"|"dhuhr"|"asr"|"maghrib"|"isha"; label: string; time: Date; isCurrent?: boolean; isNext?: boolean; }

export function slotsFromTimes(t: PrayerTimes, now = new Date()): PrayerSlot[] {
  const slots: PrayerSlot[] = [
    { key: "fajr",    label: "Fajr",    time: t.fajr },
    { key: "sunrise", label: "Sunrise", time: t.sunrise },
    { key: "dhuhr",   label: "Dhuhr",   time: t.dhuhr },
    { key: "asr",     label: "Asr",     time: t.asr },
    { key: "maghrib", label: "Maghrib", time: t.maghrib },
    { key: "isha",    label: "Isha",    time: t.isha },
  ];
  const nextIdx = slots.findIndex((s) => s.time.getTime() > now.getTime());
  const currentIdx = nextIdx === -1 ? slots.length - 1 : Math.max(0, nextIdx - 1);
  return slots.map((s, i) => ({ ...s, isCurrent: i === currentIdx, isNext: i === nextIdx }));
}

export function fmtTime(d: Date, locale = "en-US"): string {
  return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

export function fmtCountdown(targetMs: number): string {
  const diff = Math.max(0, targetMs - Date.now());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}
