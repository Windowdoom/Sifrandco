"use client";
import { useCallback, useEffect, useState } from "react";
import LocationGate from "@/components/LocationGate";
import { SectionTitle } from "@/components/Brand";

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
  distance: number;       // metres
  address?: string;
  denomination?: string;
}

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

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

function Mosques({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  const [radiusKm, setRadiusKm] = useState(5);
  const [list, setList] = useState<Mosque[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMosques = useCallback(async () => {
    setLoading(true);
    setError(null);
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
            } as Mosque;
          })
          .filter(Boolean) as Mosque[];
        items.sort((a, b) => a.distance - b.distance);
        setList(items);
        setLoading(false);
        return;
      } catch {
        continue;
      }
    }
    setError("Could not reach the OpenStreetMap servers. Try again in a moment.");
    setLoading(false);
  }, [lat, lng, radiusKm]);

  useEffect(() => { fetchMosques(); }, [fetchMosques]);

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker={label ?? "Around you"} title="Nearby mosques" />

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

      <div className="mt-5 space-y-2.5">
        {loading && <div className="text-sm text-tayba-900/65 dark:text-paper-200/60">Searching the map…</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}
        {list && !loading && list.length === 0 && (
          <div className="card p-5 text-sm text-tayba-900/75 dark:text-paper-200/70">
            No mosques tagged within {radiusKm} km on OpenStreetMap. Try a larger radius, or if you know of one,
            consider adding it on <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-gold-600 underline">openstreetmap.org</a>.
          </div>
        )}
        {list?.map((m) => (
          <article key={m.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-serif text-[1.1rem] font-medium leading-tight text-tayba-900 dark:text-paper-50">
                  {m.name}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]">
                  <span className="font-medium text-gold-700">{fmtDistance(m.distance)}</span>
                  {m.denomination && (
                    <span className="text-tayba-900/60 dark:text-paper-200/60">· {m.denomination}</span>
                  )}
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
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-tayba-900/55 dark:text-paper-200/55">
        Data from OpenStreetMap contributors, queried live with no account or tracking. Listings depend on
        what volunteers have tagged in your area. Iqama times vary by masjid, please call ahead for jummah.
      </p>
    </div>
  );
}
