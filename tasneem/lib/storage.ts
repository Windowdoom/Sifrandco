// Local-only storage. Nothing leaves the device.

export interface LocationCache { lat: number; lng: number; label?: string; ts: number; }

const KEYS = {
  settings: "tasneem.settings.v1",
  location: "tasneem.location.v1",
  tasbih: "tasneem.tasbih.v1",
  qada: "tasneem.qada.v1",
  hifz: "tasneem.hifz.v1",
  sadaqah: "tasneem.sadaqah.v1",
  prayerLog: "tasneem.prayerlog.v1",
  bookmarks: "tasneem.bookmarks.v1",
};

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

export function saveJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export const Storage = {
  KEYS,
  load: loadJSON,
  save: saveJSON,
  exportAll(): string {
    const out: Record<string, unknown> = {};
    for (const k of Object.values(KEYS)) {
      const raw = localStorage.getItem(k);
      if (raw) out[k] = JSON.parse(raw);
    }
    return JSON.stringify({ app: "tasneem", version: 1, exportedAt: new Date().toISOString(), data: out }, null, 2);
  },
  importAll(payload: string): boolean {
    try {
      const parsed = JSON.parse(payload);
      if (parsed?.app !== "tasneem") return false;
      Object.entries(parsed.data ?? {}).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
      return true;
    } catch { return false; }
  },
};
