// sw.js — versión FINAL: se autodesregistra para no interferir con el blog nav
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
    .then(() => self.registration.unregister())
  );
});
