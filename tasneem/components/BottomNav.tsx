"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/",        label: "Home",   icon: <DotStar /> },
  { href: "/prayer",  label: "Prayer", icon: <Crescent /> },
  { href: "/qibla",   label: "Qibla",  icon: <Compass /> },
  { href: "/quran",   label: "Quran",  icon: <Book /> },
  { href: "/duas",    label: "Duas",   icon: <Hands /> },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-paper-200 bg-paper-50/95 backdrop-blur dark:border-tayba-700 dark:bg-tayba-900/95">
      <div className="mx-auto flex max-w-2xl items-stretch justify-between px-2 py-1.5">
        {ITEMS.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          return (
            <Link key={it.href} href={it.href} className="flex-1">
              <div className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
                active
                  ? "text-tayba-600 dark:text-gold-300"
                  : "text-tayba-900/60 dark:text-paper-200/60 hover:text-tayba-600"}`}>
                <span className={`grid h-7 w-7 place-items-center rounded-full ${active ? "bg-tayba-50 dark:bg-tayba-700/50 ring-1 ring-gold-400/40" : ""}`}>
                  {it.icon}
                </span>
                <span>{it.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Crescent() { return (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>
); }
function Compass() { return (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-5 2 2-5 5-2Z"/></svg>
); }
function Book() { return (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 5v14"/></svg>
); }
function Hands() { return (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 11V6a1.5 1.5 0 1 1 3 0v5"/><path d="M10 11V5a1.5 1.5 0 1 1 3 0v6"/><path d="M13 11V6a1.5 1.5 0 1 1 3 0v7"/><path d="M16 13V8a1.5 1.5 0 1 1 3 0v8a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5l-2-4a1.5 1.5 0 0 1 2.5-1.6L7 12"/></svg>
); }
function DotStar() { return (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2"/><circle cx="12" cy="12" r="2.5"/></svg>
); }
