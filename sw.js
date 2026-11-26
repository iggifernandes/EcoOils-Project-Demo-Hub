/* Simple offline cache: pre-cache the whole demo on first load, serve cache-first.
   Bump CACHE when files change so booth devices pick up the update. */
const CACHE = "demohub-v1.7";
const FILES = ["./", "index.html", "patroli.html", "patroli-qr.html", "demo.html", "scan.html", "demo-qr.html", "css/style.css", "css/patroli.css", "css/demos.css",
  "js/i18n.js", "js/mocks.js", "js/tour.js", "js/app.js", "js/patroli.js", "js/demos.js", "js/scan.js", "js/sync.js", "vendor/qrcode.js", "vendor/jsQR.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return; /* live relay (ntfy) bypasses the cache */
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).catch(() => caches.match("index.html"))));
});
