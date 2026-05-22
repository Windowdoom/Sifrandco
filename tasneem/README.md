# Tasneem · تَسْنِيم

> *"And its mixture is of Tasneem, a spring from which those near [to Allah] drink."* — **Quran 83:27**

An ad-free, telemetry-free Islamic worship companion. Runs on any device with a browser, installable as a PWA on iOS / Android / desktop.

## Identity

**Name** — Tasneem (تَسْنِيم), the highest spring in Jannah, drunk pure by the *muqarrabun* (those nearest to Allah). The metaphor: an app that helps elevate daily worship to the highest.

**Palette** — the Prophet ﷺ's beloved colours plus a classical gold accent:

| Token | Hex | Meaning |
|---|---|---|
| Tayba Green | `#0A5C36` | Deep emerald — the Prophet ﷺ loved green; green is the colour of Jannah's garments (Q 18:31) |
| Madinah Green | `#1B7A4F` | Lighter accent |
| Pure White | `#FAFAF7` | Warm white — *"Wear white clothes…"* (Abu Dawud 4061) |
| Tasneem Gold | `#C9A961` | Muted classical gold |
| Deep Gold | `#B8860B` | Ornamental highlights |
| Night | `#0B1F17` | Dark-mode background |

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for the design system
- **adhan** library for prayer-time calculations (BSD, by Batoul Apps — purely on-device math)
- **quran.com API** for Quran text & translations (Sahih International default)
- **sunnah.com** links for all hadith citations
- **PWA manifest** — installable, runs offline after first load
- **localStorage** for all user state — nothing leaves the device

## Features (current scaffold)

| Route | Feature |
|---|---|
| `/` | Dashboard with next prayer, hijri date, quick tiles |
| `/prayer` | Full 5 prayers + sunrise, with day navigation |
| `/qibla` | GPS + magnetometer compass, distance to Kaaba |
| `/quran` | Surah list + per-surah reader (Uthmani script + Sahih International) |
| `/duas` | Categorised verified duas (Hisn al-Muslim references) |
| `/tasbih` | Counter with haptic feedback, six classical adhkar presets |
| `/names` | All 99 Names with Arabic, transliteration, and meaning |
| `/hadith` | Six-Book index linking to sunnah.com for verification |
| `/calendar` | Dual Gregorian / Hijri calendar + key dates |
| `/zakat` | Nisab calculator (gold + silver thresholds, lower applies) |
| `/qada` | Make-up prayer tracker |
| `/ramadan` | Suhoor / Iftar countdown + Laylat al-Qadr highlight on odd nights |
| `/settings` | Calculation method, madhab, high-latitude rule, export/import |
| `/donate` | One-time and monthly support — no premium tier |

## Authentication chain

Every Quranic citation = quran.com (Sahih International default). Every hadith = sunnah.com with chapter and number. The methodology is identical to the verified references library in `../Lyfe-Islamic/REFERENCES.md` — only sahih and hasan hadith from the Six Books are quoted; no daif or mawdu narrations.

## Running

```bash
cd tasneem
npm install
npm run dev
```

Then open http://localhost:3000.

## Build for any device

- **Web** — `npm run build && npm run start`. Deploy to Vercel/Netlify/Cloudflare Pages.
- **iOS / Android / Desktop** — installable as a PWA from the browser. Wrap with **Capacitor** for app-store distribution when desired.

## Privacy & ethics

- No analytics, no telemetry, no tracking pixels
- Location lives only in `localStorage` and is never transmitted
- Only outbound network calls: Quran/Hadith API requests when you open those pages
- No accounts, no sign-up, no community features
- Donation links are external (avoids in-app purchase platforms harvesting data)

## License

MIT — to remain free, forever.
