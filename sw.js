// Offline support: keeps the app working with no signal once it has been opened.
const CACHE = "hw-v5";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192-gold.png", "icons/icon-512-gold.png", "icons/apple-touch-icon-gold.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const same = u.origin === location.origin, font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!same && !font) return;
  // Network first for the page so updates show up; cache as the fallback.
  e.respondWith(fetch(same ? new Request(e.request, {cache: "no-cache"}) : e.request).then(r => { if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
