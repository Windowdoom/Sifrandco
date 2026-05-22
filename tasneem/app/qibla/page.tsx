"use client";
import { useEffect, useState } from "react";
import LocationGate from "@/components/LocationGate";
import { SectionTitle } from "@/components/Brand";
import { distanceToKaabaKm, qiblaBearing } from "@/lib/qibla";

export default function Qibla() {
  return <LocationGate>{(loc) => <Compass lat={loc.lat} lng={loc.lng} label={loc.label} />}</LocationGate>;
}

function Compass({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  const [heading, setHeading] = useState<number | null>(null);
  const [permError, setPermError] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);
  const qibla = qiblaBearing(lat, lng);
  const distance = distanceToKaabaKm(lat, lng);

  useEffect(() => {
    if (!granted) return;
    function handle(e: DeviceOrientationEvent & { webkitCompassHeading?: number }) {
      const h = e.webkitCompassHeading ?? (typeof e.alpha === "number" ? 360 - e.alpha : null);
      if (h !== null) setHeading(h);
    }
    window.addEventListener("deviceorientation", handle as EventListener, true);
    return () => window.removeEventListener("deviceorientation", handle as EventListener, true);
  }, [granted]);

  async function enable() {
    setPermError(null);
    const D = (window as any).DeviceOrientationEvent;
    if (D && typeof D.requestPermission === "function") {
      try {
        const res = await D.requestPermission();
        if (res !== "granted") { setPermError("Compass permission denied."); return; }
      } catch (e: any) { setPermError(e?.message ?? "Could not request compass permission."); return; }
    }
    setGranted(true);
  }

  const arrowAngle = heading !== null ? qibla - heading : qibla;
  const aligned = heading !== null && Math.abs(((arrowAngle + 540) % 360) - 180) < 5;

  return (
    <div className="px-4 pt-8">
      <SectionTitle kicker="Bait Allah · The Kaaba" title="Qibla" />

      <div className="card relative mx-auto mt-2 grid aspect-square max-w-md place-items-center p-6">
        <div className="absolute inset-6 rounded-full border border-paper-200 dark:border-tayba-700" />
        <div className="absolute inset-12 rounded-full border border-gold-400/40" />
        {["N","E","S","W"].map((c, i) => (
          <div key={c} className="absolute text-[10px] font-medium tracking-widest text-tayba-900/40 dark:text-paper-200/40"
            style={{
              top: i === 0 ? "1.5rem" : i === 2 ? "auto" : "50%",
              bottom: i === 2 ? "1.5rem" : "auto",
              left: i === 3 ? "1.5rem" : i === 1 ? "auto" : "50%",
              right: i === 1 ? "1.5rem" : "auto",
              transform: i === 0 || i === 2 ? "translateX(-50%)" : "translateY(-50%)",
            }}>{c}</div>
        ))}

        <div className="absolute inset-0 grid place-items-center transition-transform"
          style={{ transform: `rotate(${arrowAngle}deg)`, transitionDuration: "120ms" }}>
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <linearGradient id="qg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#D6BB6A"/>
                <stop offset="1" stopColor="#B8860B"/>
              </linearGradient>
            </defs>
            <polygon points="50,12 56,50 50,46 44,50" fill="url(#qg)" stroke="#0A5C36" strokeWidth="0.6"/>
            <circle cx="50" cy="50" r="3" fill="#0A5C36"/>
            <text x="50" y="9" textAnchor="middle" fontSize="6" fill="#0A5C36" fontWeight="700">ﷺ</text>
          </svg>
        </div>

        <div className="relative z-10 text-center">
          <div className="arabic text-3xl text-tayba-700 dark:text-paper-50">الكَعبَة</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-gold-500">{Math.round(qibla)}° from North</div>
          {aligned && <div className="mt-2 text-xs font-medium text-tayba-600 dark:text-gold-300">You are facing the Qibla</div>}
        </div>
      </div>

      {!granted && (
        <div className="mt-4 text-center">
          <button onClick={enable} className="btn-primary">Enable compass</button>
          {permError && <div className="mt-2 text-xs text-red-700">{permError}</div>}
          <div className="mt-2 text-[11px] text-tayba-900/50 dark:text-paper-200/50">iOS requires tapping to allow motion sensors. Hold your device flat and turn slowly.</div>
        </div>
      )}

      <div className="mt-6 card p-4 text-sm">
        <div className="flex justify-between"><span className="text-tayba-900/60 dark:text-paper-200/60">From</span><span>{label ?? `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`}</span></div>
        <div className="flex justify-between"><span className="text-tayba-900/60 dark:text-paper-200/60">Bearing to Kaaba</span><span>{qibla.toFixed(1)}°</span></div>
        <div className="flex justify-between"><span className="text-tayba-900/60 dark:text-paper-200/60">Distance</span><span>{distance.toLocaleString(undefined, { maximumFractionDigits: 0 })} km</span></div>
      </div>
    </div>
  );
}
