// Service Worker — cache offline-first
// Incrementar CACHE_VERSION sempre que alterar qualquer ficheiro estático

const CACHE_VERSION = 'v48';
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
    './icon-maskable.png',
    './logo.jpg'
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

// --- Fetch: network-first para HTML (pega sempre última versão), cache para CDNs ---
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
        // NETWORK-FIRST: tentar buscar sempre a versão mais recente.
        // Se falhar (offline), cai para cache. Garante que atualizações chegam ao utilizador.
        event.respondWith(
            fetch(req).then(resp => {
                // Sucesso: actualiza cache e devolve
                const copy = resp.clone();
                caches.open(CACHE_NAME).then(c => c.put(req, copy));
                return resp;
            }).catch(() => caches.match(req))
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
