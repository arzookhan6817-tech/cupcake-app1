const CACHE_NAME = 'cupcake-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  // Don't intercept Firebase API calls
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('identitytoolkit.googleapis.com')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Network first, fallback to cache for HTML
      if (event.request.mode === 'navigate') {
        return fetch(event.request).catch(() => cached || caches.match('/index.html'));
      }
      
      // Cache first for assets
      return cached || fetch(event.request).then(response => {
        // Cache new assets dynamically
        if (response.ok && event.request.url.startsWith('http')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
