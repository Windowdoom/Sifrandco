"use client";
import { useEffect, useRef, useState } from "react";
import type { Dua } from "@/data/duas";

interface Props {
  dua: Dua;
  open: boolean;
  onClose: () => void;
}

export default function ShareDua({ dua, open, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [working, setWorking] = useState<"idle" | "download" | "share" | "copy">("idle");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const renderPng = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const { toBlob } = await import("html-to-image");
    return toBlob(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: "#0B1F17",
      cacheBust: true,
    });
  };

  const onDownload = async () => {
    setWorking("download");
    try {
      const blob = await renderPng();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasneem-${dua.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
      flash("Saved");
    } catch {
      flash("Could not save");
    } finally {
      setWorking("idle");
    }
  };

  const onShare = async () => {
    setWorking("share");
    try {
      const blob = await renderPng();
      if (!blob) { setWorking("idle"); return; }
      const file = new File([blob], `tasneem-${dua.id}.png`, { type: "image/png" });
      const data: ShareData = {
        title: dua.title,
        text: `${dua.title}\n${dua.transliteration}\n${dua.translation}\n${dua.reference}`,
      };
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        data.files = [file];
      }
      if (navigator.share) {
        await navigator.share(data);
      } else {
        onDownload();
      }
    } catch {
      // user cancelled or share unavailable
    } finally {
      setWorking("idle");
    }
  };

  const onCopy = async () => {
    setWorking("copy");
    try {
      const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\n— ${dua.reference}`;
      await navigator.clipboard.writeText(text);
      flash("Copied");
    } catch {
      flash("Could not copy");
    } finally {
      setWorking("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tayba-900/70 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="relative max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-paper-50 p-4 shadow-soft dark:bg-tayba-800"
        onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-tayba-900/70 hover:bg-paper-100 dark:text-paper-200/80 dark:hover:bg-tayba-700">
          ✕
        </button>

        {/* Card preview - what gets exported */}
        <div
          ref={cardRef}
          className="relative mx-auto overflow-hidden rounded-2xl text-paper-50"
          style={{
            background: "radial-gradient(ellipse at top, #0A5C36 0%, #08482B 45%, #0B1F17 100%)",
            width: "100%",
            padding: "32px 24px",
          }}>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, #C9A961 1px, transparent 1.5px), radial-gradient(circle at 0 0, #C9A961 1px, transparent 1.5px), radial-gradient(circle at 100% 100%, #C9A961 1px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-gold-300/90">
              <span>Tasneem</span>
              <span>{dua.grading ?? "Verified"}</span>
            </div>
            <h3 className="mt-3 font-serif text-2xl font-medium leading-tight text-paper-50">
              {dua.title}
            </h3>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />

            <div className="arabic text-[1.45rem] leading-[2.3] text-paper-50">
              {dua.arabic}
            </div>
            <p className="mt-3 text-[0.85rem] italic leading-relaxed text-paper-50/80">
              {dua.transliteration}
            </p>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-paper-50/90">
              {dua.translation}
            </p>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

            <div className="flex items-end justify-between gap-2 text-[10px]">
              <span className="text-paper-50/70">{dua.reference}</span>
              <span className="arabic text-base text-gold-300/90">تَسْنِيم</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={onShare}
            disabled={working !== "idle"}
            className="rounded-xl bg-tayba-600 px-3 py-2.5 text-sm font-medium text-paper-50 transition hover:bg-tayba-700 disabled:opacity-60">
            {working === "share" ? "..." : "Share"}
          </button>
          <button
            onClick={onDownload}
            disabled={working !== "idle"}
            className="rounded-xl border border-tayba-200 px-3 py-2.5 text-sm font-medium text-tayba-900 transition hover:border-gold-400 disabled:opacity-60 dark:border-tayba-700 dark:text-paper-50">
            {working === "download" ? "..." : "Save PNG"}
          </button>
          <button
            onClick={onCopy}
            disabled={working !== "idle"}
            className="rounded-xl border border-tayba-200 px-3 py-2.5 text-sm font-medium text-tayba-900 transition hover:border-gold-400 disabled:opacity-60 dark:border-tayba-700 dark:text-paper-50">
            {working === "copy" ? "..." : "Copy text"}
          </button>
        </div>

        {toast && (
          <div className="mt-3 text-center text-xs text-tayba-900/70 dark:text-paper-200/70">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
