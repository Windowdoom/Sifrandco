// Tasneem service worker.
// Strategy:
//   - HTML / navigation: network-first, fall back to cache, fall back to offline shell.
//   - Static assets (JS / CSS / fonts / images): stale-while-revalidate.
//   - Everything else: pass through.
// Nothing is sent off-device. The cache lives only on this device.

const VERSION = "tasneem-v2";
const RUNTIME = `${VERSION}-runtime`;
const SHELL = `${VERSION}-shell`;
const OFFLINE_URL = "/";

const SHELL_ASSETS = [
  "/",
  "/manifest.json",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle same-origin requests; let cross-origin (Overpass, sunnah.com) hit the network normally.
  if (url.origin !== self.location.origin) return;

  // Navigation requests (HTML pages)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (/\.(?:js|css|woff2?|ttf|svg|png|jpg|jpeg|webp|ico|json)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(RUNTIME).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});

// Notifications: when the page schedules a prayer reminder it asks the SW to show it.
// We do not push from any server. Everything is local-only.
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "tasneem-notify") return;
  const { title, body, tag } = event.data;
  self.registration.showNotification(title, {
    body,
    tag: tag || "tasneem-prayer",
    icon: "/icon.svg",
    badge: "/icon.svg",
    silent: false,
    requireInteraction: false,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((all) => {
      const open = all.find((c) => c.url.includes(self.location.origin));
      if (open) return open.focus();
      return self.clients.openWindow("/prayer");
    })
  );
});
