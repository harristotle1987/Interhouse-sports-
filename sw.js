
const CACHE_NAME = 'sovereign-cache-v1';
const API_CACHE_NAME = 'sovereign-api-cache-v1';

const SHELL_ASSETS = [
  '/',
  '/index.html'
];

const API_ENDPOINTS = [
  '/rest/v1/global_leaderboard',
  '/rest/v1/member_telemetry_feed',
  '/rest/v1/tournament_timeline',
  '/rest/v1/matches'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(SHELL_ASSETS);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { url } = event.request;

  const isApiUrl = API_ENDPOINTS.some(endpoint => url.includes(endpoint));

  if (isApiUrl) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        // Stale-while-revalidate for API calls
        return fetch(event.request)
          .then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => {
            // If network fails, serve from cache
            return cache.match(event.request);
          });
      })
    );
  } else {
    event.respondWith(
      // Cache-first for shell assets
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});
