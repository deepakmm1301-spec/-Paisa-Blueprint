const CACHE_NAME = 'paisa-blueprint-cache-v1';
const API_CACHE_NAME = 'paisa-blueprint-api-v1';

// Assets to cache immediately on installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Installation: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activation: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetching: Caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Handle API requests
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful GET, cache the fresh API response
          if (event.request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to serve from API Cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving cached API response for:', requestUrl.pathname);
              return cachedResponse;
            }
            // If offline and no cache, return fallback JSON for market-insights
            if (requestUrl.pathname === '/api/market-insights') {
              return new Response(JSON.stringify([
                {
                  id: "offline-fallback-1",
                  category: "Bihar Teacher Transfer",
                  title: "e-Shikshakosh Inter-District & Mutual Transfer (Offline Mode)",
                  summary: "You are currently offline. Registered teachers can request mutual and inter-district transfers directly on the e-Shikshakosh portal once connectivity is restored.",
                  status: "Cached Offline",
                  statusColor: "amber",
                  date: "Offline Mode",
                  impact: "Reconnect to load live updates."
                }
              ]), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            return new Response(JSON.stringify({ error: "You are offline." }), {
              status: 503,
              statusHeader: "Service Unavailable",
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Handle static assets & HTML documents
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // If it's a CSS/JS asset or image, serve immediately and update in background (Stale-While-Revalidate)
        if (
          requestUrl.pathname.endsWith('.js') ||
          requestUrl.pathname.endsWith('.css') ||
          requestUrl.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)
        ) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {/* Ignore network update failure offline */});
          return cachedResponse;
        }
        return cachedResponse;
      }

      // If not in cache, fetch from network and add to cache
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Avoid caching chunk files directly if dynamic or browser developer tools requests
            if (event.request.method === 'GET') {
              cache.put(event.request, responseToCache);
            }
          });
          return response;
        })
        .catch(() => {
          // Fallback if network and cache fail
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
    })
  );
});
