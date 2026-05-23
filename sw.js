const CACHE_NAME = 'trading-toolkit-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/css/style.min.css',
  '/js/config.min.js',
  '/js/calculators.min.js',
  '/index.html',
  '/blog.html',
  '/about.html',
  '/contact.html',
  '/privacy-policy.html',
  '/terms.html',
  '/disclaimer.html',
  '/404.html',
  '/blog/position-sizing-guide.html',
  '/blog/stop-loss-strategies.html',
  '/blog/technical-vs-fundamental-analysis.html'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (requestUrl.origin !== location.origin) return;

  // For HTML pages - network first (always get fresh content)
  if (requestUrl.pathname.endsWith('.html') || requestUrl.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For static assets (CSS, JS, images) - cache first
  if (
    requestUrl.pathname.match(/\.(css|js|png|svg|ico|json|webp)$/) ||
    requestUrl.pathname.includes('/fonts.')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          });
        })
    );
    return;
  }

  // Everything else - network only
  event.respondWith(fetch(event.request));
});
