// v5 — network-first strategy, always gets latest version
const CACHE = 'nawaz-v5';

self.addEventListener('install', e => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', e => {
  // Delete ALL old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Never cache API calls or fonts
  if (
    e.request.url.includes('anthropic.com') ||
    e.request.url.includes('fonts.googleapis') ||
    e.request.url.includes('fonts.gstatic') ||
    e.request.url.includes('wa.me') ||
    e.request.url.includes('whatsapp')
  ) return;

  // NETWORK FIRST — always try network, only use cache if offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Save fresh copy to cache
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(e.request) || caches.match('./index.html');
      })
  );
});
