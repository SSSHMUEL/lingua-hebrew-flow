// safer service worker: network-first for navigation, cache-first for assets
const CACHE_NAME = 'talk-fix-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => {
      if (key !== CACHE_NAME) return caches.delete(key);
    }))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(req).then(networkRes => {
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return networkRes;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkRes => {
        if (!req.url.startsWith(self.location.origin)) return networkRes;
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return networkRes;
      }).catch(() => caches.match('/favicon-32x32.png'));
    })
  );
});