"use client";
import { useEffect, useState } from "react";
import { Storage, type LocationCache } from "@/lib/storage";

interface Props {
  children: (loc: LocationCache) => React.ReactNode;
}

export default function LocationGate({ children }: Props) {
  const [loc, setLoc] = useState<LocationCache | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = Storage.load<LocationCache | null>(Storage.KEYS.location, null);
    if (cached) setLoc(cached);
  }, []);

  function request() {
    setError(null); setLoading(true);
    if (!("geolocation" in navigator)) { setError("This device has no GPS / geolocation."); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: LocationCache = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() };
        Storage.save(Storage.KEYS.location, next);
        setLoc(next); setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 }
    );
  }

  function setManual(lat: number, lng: number, label: string) {
    const next: LocationCache = { lat, lng, label, ts: Date.now() };
    Storage.save(Storage.KEYS.location, next);
    setLoc(next);
  }

  if (loc) return <>{children(loc)}</>;

  return (
    <div className="card mx-4 mt-6 p-6">
      <h2 className="font-serif text-2xl text-tayba-700">Set your location</h2>
      <p className="mt-2 text-sm text-tayba-900/70">
        Tasneem uses your location only on this device, never sent anywhere, to calculate prayer times and Qibla direction.
      </p>

      <button onClick={request} disabled={loading} className="btn-primary mt-5 w-full">
        {loading ? "Locating…" : "Use my current location"}
      </button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      <div className="gold-rule my-5" />

      <p className="text-xs font-medium text-tayba-900/60">Or pick a city manually:</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        {[
          { l: "Makkah", lat: 21.3891, lng: 39.8579 },
          { l: "Madinah", lat: 24.4683, lng: 39.6142 },
          { l: "Jerusalem (al-Quds)", lat: 31.7767, lng: 35.2345 },
          { l: "Istanbul", lat: 41.0082, lng: 28.9784 },
          { l: "Cairo", lat: 30.0444, lng: 31.2357 },
          { l: "London", lat: 51.5074, lng: -0.1278 },
          { l: "New York", lat: 40.7128, lng: -74.006 },
          { l: "Kuala Lumpur", lat: 3.139, lng: 101.6869 },
        ].map((c) => (
          <button key={c.l} onClick={() => setManual(c.lat, c.lng, c.l)}
            className="rounded-lg border border-paper-200 px-3 py-2 text-left hover:border-gold-400 hover:bg-gold-50">
            {c.l}
          </button>
        ))}
      </div>
    </div>
  );
}
