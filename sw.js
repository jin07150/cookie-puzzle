// Generated at build time. Precaches the whole game so it works offline.
// A new version installs in the background and WAITS until the player agrees to update
// (the page sends SKIP_WAITING). Progress lives in localStorage and is never touched.
const CACHE = 'cookie-puzzle-99f1c11da9';
const APP_VERSION = '1.3.0';
const FILES = ["./","./assets/index-vjNtc0va.js","./assets/index-CzZkOD1x.css","./assets/worker-BkeND48m.js","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./icons/icon-180.png"];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('cookie-puzzle-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'GET_VERSION' && e.ports[0]) e.ports[0].postMessage(APP_VERSION);
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => (req.mode === 'navigate' ? caches.match('./') : Response.error()));
    })
  );
});
