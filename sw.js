/**
 * HeatGuard Service Worker — cache-first
 */
const CACHE = 'heatguard-v1.1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.svg',
  './icon-512.svg',
  './icon-maskable.svg',
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const API_HOSTS = ['api.open-meteo.com', 'geocoding-api.open-meteo.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then(
        (cached) => cached || fetch(req).catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  if (FONT_HOSTS.includes(url.host)) {
    e.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const network = fetch(req).then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  // API météo : network-first avec fallback cache (offline → dernière valeur connue)
  if (API_HOSTS.includes(url.host)) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(
      (cached) => cached ||
        fetch(req).then((res) => {
          if (res && res.status === 200 && url.origin === self.location.origin) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        }).catch(() => cached)
    )
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
