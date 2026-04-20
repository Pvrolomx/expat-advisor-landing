const CACHE_NAME = 'expat-advisor-v2';

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => Promise.all(
            names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);
    
    // Solo cacheamos same-origin
    if (url.origin !== location.origin) return;
    
    // HTML y navegación: network-first (siempre intentar red primero)
    // Esto asegura que cambios en HTML se ven inmediatamente
    if (req.mode === 'navigate' || 
        req.destination === 'document' || 
        url.pathname.endsWith('.html') || 
        url.pathname.endsWith('/')) {
        event.respondWith(
            fetch(req).then(resp => {
                const clone = resp.clone();
                caches.open(CACHE_NAME).then(c => c.put(req, clone));
                return resp;
            }).catch(() => caches.match(req))
        );
        return;
    }
    
    // Assets estáticos (imágenes, CSS, JS): cache-first para performance
    event.respondWith(
        caches.match(req).then(cached => cached || fetch(req).then(resp => {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone));
            return resp;
        }))
    );
});
