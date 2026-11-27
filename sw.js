// Generated at build time. Precaches the whole game so it works offline.
// A new version installs in the background and WAITS until the player agrees to update
// (the page sends SKIP_WAITING). Progress lives in localStorage and is never touched.
const PREFIX = 'cookie-puzzle-'; // 'cookie-puzzle-' (real game) or 'cookie-puzzle-staging-' (test version)
const CACHE = PREFIX + 'd02073c77a';
const APP_VERSION = '1.4.0';
const BUILD_ID = '97be10b';
const NOTES = ["설정과 '내 기록 지키기'를 보기 쉽게 정리했어요","귀여운 새 글꼴, 더 짧아진 설명","20분 고민한 스테이지는 건너뛸 수 있어요"]; // "what's better" lines for this version, shown before updating
const FILES = ["./","./assets/index-C6bNqKJB.js","./assets/index-DpPbRLFq.css","./assets/jua-BPGZmr7m.woff2","./assets/worker-BkeND48m.js","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./icons/icon-180.png"];
const SCOPE = self.registration.scope; // e.g. https://jin07150.github.io/cookie-puzzle-staging/

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
});

// Remove every OLD cache of THIS app (whatever it was named), never another app's caches.
// The real game and the test address share one origin, so cache storage is shared too:
// a cache belongs to this app if it holds this app's start page (its scope URL).
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE)
            .map((k) =>
              caches.open(k).then((c) => c.match(SCOPE, { ignoreSearch: true, ignoreVary: true })).then((hit) => (hit ? caches.delete(k) : false))
            )
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'GET_VERSION' && e.ports[0]) e.ports[0].postMessage(APP_VERSION);
  if (e.data === 'GET_INFO' && e.ports[0]) e.ports[0].postMessage({ version: APP_VERSION, build: BUILD_ID, notes: NOTES });
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    // Look ONLY in this version's own cache. (caches.match() would search every cache on the
    // origin and could serve a stale page from an older version's leftover cache.)
    // ignoreVary: module scripts carry extra request headers (Origin, Accept-Encoding); with a
    // "Vary" response header the lookup would otherwise miss the precached file.
    caches.open(CACHE).then((cache) =>
      cache.match(req, { ignoreSearch: true, ignoreVary: true }).then((hit) => {
        if (hit) return hit;
        return fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => (req.mode === 'navigate' ? cache.match('./') : Response.error()));
      })
    )
  );
});
