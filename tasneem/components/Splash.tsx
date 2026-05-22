"use client";
import { useEffect, useState } from "react";

const SEEN_KEY = "tasneem.splash.seen";

export default function Splash() {
  const [phase, setPhase] = useState<"hidden" | "show" | "fade">("hidden");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    sessionStorage.setItem(SEEN_KEY, "1");
    setPhase("show");
    const fade = window.setTimeout(() => setPhase("fade"), 1400);
    const done = window.setTimeout(() => setPhase("hidden"), 2100);
    return () => { window.clearTimeout(fade); window.clearTimeout(done); };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-[700ms] ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at center, #0A5C36 0%, #08482B 45%, #0B1F17 100%)",
      }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, #C9A961 1px, transparent 1.5px), radial-gradient(circle at 0 0, #C9A961 1px, transparent 1.5px), radial-gradient(circle at 100% 100%, #C9A961 1px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative flex flex-col items-center splash-rise">
        <div className="arabic text-[3.75rem] leading-none text-paper-50 sm:text-[5rem]">
          تَسْنِيم
        </div>
        <div className="splash-rule mt-4 h-px w-32 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="mt-3 text-[10px] uppercase tracking-[0.4em] text-gold-300/90">
          Tasneem
        </div>
      </div>
    </div>
  );
}
