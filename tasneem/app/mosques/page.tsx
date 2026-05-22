"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import LocationGate from "@/components/LocationGate";
import { SectionTitle } from "@/components/Brand";
import { Storage } from "@/lib/storage";
import { DEFAULT_SETTINGS, computePrayerTimes, fmtTime, slotsFromTimes } from "@/lib/prayer-times";

export default function MosquesPage() {
  return (
    <LocationGate>
      {(loc) => <Mosques lat={loc.lat} lng={loc.lng} label={loc.label} />}
    </LocationGate>
  );
}

interface Mosque {
  id: number;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  address?: string;
  denomination?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  wheelchair?: string;
  women?: string;
  language?: string;
  wudu?: string;
}

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

const CACHE_KEY_PREFIX = "tasneem.mosques.v1.";

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function fmtDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(m < 10_000 ? 1 : 0)} km`;
}

// Very rough opening_hours parser: returns true if a 24-7 or simple time range covers now.
// Real OSM opening_hours is much richer; this only handles the common cases without dragging
// in a parser library.
function probablyOpenNow(rule?: string): boolean | null {
  if (!rule) return null;
  const r = rule.toLowerCase().trim();
  if (r === "24/7") return true;
  const now = new Date();
  const day = ["su", "mo", "tu", "we", "th", "fr", "sa"][now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const part of r.split(";")) {
    const m = part.trim().match(/^(?:([a-z,\-]+)\s+)?(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    if (!m) continue;
    const days = m[1];
    if (days && !days.split(/[,\-]/).includes(day) && !days.includes(day)) continue;
    const start = parseInt(m[2]) * 60 + parseInt(m[3]);
    const end = parseInt(m[4]) * 60 + parseInt(m[5]);
    if (mins >= start && mins <= end) return true;
  }
  return false;
}

function Mosques({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  const [radiusKm, setRadiusKm] = useState(5);
  const [list, setList] = useState<Mosque[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);

  const cacheKey = `${CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lng.toFixed(2)}_${radiusKm}`;

  const fetchMosques = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingCache(false);
    const radius = radiusKm * 1000;
    const query = `[out:json][timeout:25];(
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
    );out center tags;`;

    for (const url of OVERPASS_URLS) {
      try {
        const res = await fetch(url, {
          method: "POST",
          body: "data=" + encodeURIComponent(query),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        if (!res.ok) continue;
        const data = await res.json();
        const items: Mosque[] = (data.elements || [])
          .map((el: any) => {
            const elat = el.lat ?? el.center?.lat;
            const elng = el.lon ?? el.center?.lon;
            if (typeof elat !== "number" || typeof elng !== "number") return null;
            const t = el.tags || {};
            const name = t.name || t["name:en"] || t["name:ar"] || "Unnamed masjid";
            const addrParts = [t["addr:housenumber"], t["addr:street"], t["addr:city"]].filter(Boolean);
            return {
              id: el.id,
              name,
              lat: elat,
              lng: elng,
              distance: haversine(lat, lng, elat, elng),
              address: addrParts.length ? addrParts.join(" ") : undefined,
              denomination: t.denomination,
              phone: t["contact:phone"] || t.phone,
              website: t["contact:website"] || t.website,
              openingHours: t.opening_hours,
              wheelchair: t.wheelchair,
              women: t["women"] || t["female"],
              language: t["language"] || t["language:imam"] || t["khutbah:language"],
              wudu: t["wudu"] || t["amenity:wudu"],
            } as Mosque;
          })
          .filter(Boolean) as Mosque[];
        items.sort((a, b) => a.distance - b.distance);
        setList(items);
        Storage.save(cacheKey, { items, ts: Date.now() });
        setLoading(false);
        return;
      } catch {
        continue;
      }
    }
    const cached = Storage.load<{ items: Mosque[]; ts: number } | null>(cacheKey, null);
    if (cached) {
      setList(cached.items);
      setUsingCache(true);
    } else {
      setError("Could not reach the OpenStreetMap servers and nothing is cached yet for this area.");
    }
    setLoading(false);
  }, [lat, lng, radiusKm, cacheKey]);

  useEffect(() => { fetchMosques(); }, [fetchMosques]);

  // Compute next prayer at the user's location once, share across all cards.
  const nextSlot = useMemo(() => {
    const settings = Storage.load(Storage.KEYS.settings, DEFAULT_SETTINGS);
    const now = new Date();
    const slots = slotsFromTimes(computePrayerTimes(lat, lng, now, settings), now);
    return slots.find((s) => s.isNext) ?? slots[0];
  }, [lat, lng]);

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker={label ?? "Around you"} title="Nearby mosques" />

      {nextSlot && (
        <div className="card mb-4 flex items-center justify-between gap-3 p-3.5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-gold-600">Next prayer</div>
            <div className="mt-0.5 font-serif text-[1.05rem] font-medium text-tayba-900 dark:text-paper-50">
              {nextSlot.label} <span className="text-tayba-900/70 dark:text-paper-200/70">{fmtTime(nextSlot.time)}</span>
            </div>
          </div>
          <span className="text-[11px] text-tayba-900/60 dark:text-paper-200/60">
            Call ahead, iqama varies
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs">
        <span className="text-tayba-900/70 dark:text-paper-200/70">Within</span>
        {[2, 5, 10, 25].map((r) => (
          <button
            key={r}
            onClick={() => setRadiusKm(r)}
            className={`rounded-full border px-3 py-1 transition ${
              radiusKm === r
                ? "border-gold-400 bg-gold-50 font-medium text-tayba-900"
                : "border-paper-200 text-tayba-900/75 hover:border-gold-400/60 dark:border-tayba-700 dark:text-paper-200/70"
            }`}>
            {r} km
          </button>
        ))}
      </div>

      {usingCache && (
        <div className="mt-3 rounded-lg border border-gold-400/40 bg-gold-50/60 px-3 py-2 text-[12px] text-tayba-900/80">
          Showing cached results, the map server is unreachable right now.
        </div>
      )}

      <div className="mt-5 space-y-2.5">
        {loading && !usingCache && <div className="text-sm text-tayba-900/65 dark:text-paper-200/60">Searching the map…</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}
        {list && !loading && list.length === 0 && (
          <div className="card p-5 text-sm text-tayba-900/75 dark:text-paper-200/70">
            No mosques tagged within {radiusKm} km on OpenStreetMap. Try a larger radius, or if you know of one,
            consider adding it on <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-gold-600 underline">openstreetmap.org</a>.
          </div>
        )}
        {list?.map((m) => <MosqueCard key={m.id} m={m} />)}
      </div>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-tayba-900/55 dark:text-paper-200/55">
        Data from OpenStreetMap contributors, queried live with no account or tracking. Tags depend on what
        volunteers have added. Iqama times always vary by masjid, please call ahead for jummah.
      </p>
    </div>
  );
}

function MosqueCard({ m }: { m: Mosque }) {
  const openNow = probablyOpenNow(m.openingHours);
  const chips: { label: string; tone: "good" | "info" | "gold" }[] = [];

  if (openNow === true) chips.push({ label: "Open now", tone: "good" });
  else if (openNow === false) chips.push({ label: "Closed now", tone: "info" });

  if (m.wheelchair === "yes") chips.push({ label: "Accessible", tone: "info" });
  if (m.women === "yes") chips.push({ label: "Sisters' area", tone: "info" });
  if (m.wudu === "yes") chips.push({ label: "Wudu facilities", tone: "info" });
  if (m.language) chips.push({ label: `Khutbah, ${m.language}`, tone: "gold" });
  if (m.denomination) chips.push({ label: m.denomination, tone: "info" });

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-[1.1rem] font-medium leading-tight text-tayba-900 dark:text-paper-50">
            {m.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]">
            <span className="font-medium text-gold-700">{fmtDistance(m.distance)}</span>
          </div>
          {m.address && (
            <p className="mt-1 text-[0.8rem] leading-relaxed text-tayba-900/70 dark:text-paper-200/65">
              {m.address}
            </p>
          )}
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full border border-paper-200 px-3 py-1.5 text-xs font-medium text-tayba-900 transition hover:border-gold-400 hover:text-gold-700 dark:border-tayba-700 dark:text-paper-50">
          Directions ↗
        </a>
      </div>

      {chips.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <span
              key={i}
              className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                c.tone === "good" ? "bg-tayba-50 text-tayba-700"
                : c.tone === "gold" ? "bg-gold-50 text-gold-700"
                : "bg-paper-100 text-tayba-900/80"
              }`}>
              {c.label}
            </span>
          ))}
        </div>
      )}

      {(m.phone || m.website || m.openingHours) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-paper-200/70 pt-2.5 text-[11.5px] text-tayba-900/70 dark:border-tayba-700/60 dark:text-paper-200/65">
          {m.phone && (
            <a href={`tel:${m.phone}`} className="text-gold-700 hover:underline">{m.phone}</a>
          )}
          {m.website && (
            <a href={m.website} target="_blank" rel="noopener noreferrer" className="text-gold-700 hover:underline">
              Website ↗
            </a>
          )}
          {m.openingHours && (
            <span className="truncate" title={m.openingHours}>{m.openingHours}</span>
          )}
        </div>
      )}
    </article>
  );
}
