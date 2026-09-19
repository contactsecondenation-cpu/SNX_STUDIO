const CACHE = "snx-studio-shell-v1";
const SHELL = [
  "index.html",
  "app.bundle.js",
  "styles/tokens.css",
  "styles/core.css",
  "styles/components.css",
  "styles/views.css",
  "manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Only the small app shell (JS/CSS/HTML) is cached, network-first so updates land
// immediately with an offline/instant-repeat fallback. The wallpapers, icons and
// theme catalog (hundreds of MB) are intentionally left to normal browser/network
// caching — precaching them here would fill up storage for no real benefit.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== location.origin) return;
  const isShell = SHELL.some((path) => url.pathname.endsWith("/" + path) || url.pathname === "/" + path);
  if (!isShell) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
