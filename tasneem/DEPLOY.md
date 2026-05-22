# Deploying Tasneem to Vercel

Total time: ~2 minutes. Free forever for personal projects.

## One-time setup

1. **Sign up at** https://vercel.com (use "Continue with GitHub", links your GitHub account).
2. On the dashboard, click **Add New… → Project**.
3. **Import** the `Windowdoom/Sifrandco` repository (you may need to grant Vercel access first; click "Adjust GitHub App Permissions" if you don't see it).
4. On the configure-project screen, set:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `tasneem`  ← important, the app lives in a subfolder
   - **Branch**: `claude/upbeat-clarke-IZvXZ` (or merge to `main` first, then use `main`)
   - Build / install commands: leave as defaults (they're picked up from `vercel.json`)
5. Click **Deploy**.

That's it. In ~60 seconds you'll get a URL like `https://tasneem-xxx.vercel.app`.

## Try it

Open the URL on:
- **Desktop browser**, everything works except the compass (no magnetometer on a laptop).
- **iPhone**, open in Safari → tap the share icon → **Add to Home Screen**. Now it launches like a real app. Allow location and motion when prompted.
- **Android**, open in Chrome → menu → **Install app**. Same deal.

Geolocation and the magnetometer require **HTTPS**, which Vercel gives you automatically.

## What you'll see (in this order)

1. **Location gate**, tap "Use my current location" (or pick a city). One-time prompt; cached in localStorage.
2. **Dashboard**, next-prayer countdown, hijri date, ten feature tiles.
3. Tap the bottom-nav icons to move between Prayer / Qibla / Quran / Duas.
4. On Qibla, tap "Enable compass", iOS requires a tap before motion sensors will fire.

## Updating after edits

Every push to the branch you configured = automatic redeploy. The URL stays the same.

## Custom domain

In Vercel project settings → **Domains** → add your domain (e.g. `tasneem.app`). Vercel handles the SSL cert.

## Where donations plug in

`app/donate/page.tsx` currently has `href="#"` placeholders. Drop your real Stripe Payment Link or PayPal.me URL in there once you've created them. No SDK needed, just an external link, which keeps the app PWA-pure and avoids in-app-purchase platform cuts.

## Things to know

- **Quran content** loads from `api.quran.com` on demand. The first surah view will be slightly slower; Vercel caches the response at the edge after that.
- **Notifications** (web push for adhan) require a service worker, not yet in this scaffold. Add `next-pwa` when you're ready.
- **Offline mode**, Next.js will serve cached static assets, but full offline (including the Quran pages) needs the service worker mentioned above.
