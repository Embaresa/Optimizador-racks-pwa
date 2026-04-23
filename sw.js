// Service Worker — cache offline-first
// Incrementar CACHE_VERSION sempre que alterar qualquer ficheiro estático

const CACHE_VERSION = 'v17';
const CACHE_NAME = `racks-pwa-${CACHE_VERSION}`;

// Ficheiros locais a pré-cachear
const CORE_ASSETS = [
    './',
    './index.html',
    './converter.html',
    './optimizer.html',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable.png'
];

// CDNs externos que usamos — tentamos cachear quando acedidos
const CDN_PATTERNS = [
    /cdnjs\.cloudflare\.com/,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/
];

// --- Install: pré-cache dos ficheiros core ---
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CORE_ASSETS).catch(err => {
                console.error('[SW] Erro no pré-cache:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// --- Activate: limpa caches antigos ---
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

// --- Fetch: cache-first para core, network-first para CDNs, fallback cache ---
self.addEventListener('fetch', event => {
    const req = event.request;
    
    // Só faz cache de GET
    if (req.method !== 'GET') return;
    
    const url = new URL(req.url);
    const isCDN = CDN_PATTERNS.some(p => p.test(url.href));
    const isCore = CORE_ASSETS.some(path => 
        url.pathname.endsWith(path.replace('./', '')) || url.pathname === path.replace('./', '/')
    );
    
    if (isCore) {
        // Cache-first
        event.respondWith(
            caches.match(req).then(cached => cached || fetch(req).then(resp => {
                const copy = resp.clone();
                caches.open(CACHE_NAME).then(c => c.put(req, copy));
                return resp;
            }))
        );
    } else if (isCDN) {
        // Stale-while-revalidate
        event.respondWith(
            caches.match(req).then(cached => {
                const fetchPromise = fetch(req).then(resp => {
                    if (resp.ok) {
                        const copy = resp.clone();
                        caches.open(CACHE_NAME).then(c => c.put(req, copy));
                    }
                    return resp;
                }).catch(() => cached);
                return cached || fetchPromise;
            })
        );
    }
    // Outros pedidos (ex: user-provided files) passam direto
});
