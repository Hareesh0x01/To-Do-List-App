const CACHE_NAME = 'funky-todo-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './sounds/beep.mp3',
  './sounds/chime.mp3',
  './sounds/music.mp3',
  './sounds/alert.mp3',
  './sounds/bell.mp3',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Righteous&family=Poppins:wght@400;600&display=swap'
];

// Install service worker and cache the static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell and content');
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('[Service Worker] Cache addAll failed:', error);
            // Continue even if some assets fail to cache
            return Promise.resolve();
          });
      })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests to avoid CORS issues
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://fonts.googleapis.com') &&
      !event.request.url.startsWith('https://fonts.gstatic.com') &&
      !event.request.url.startsWith('https://cdnjs.cloudflare.com')) {
    return;
  }
  
  // Handle audio files specially - they often cause CORS issues
  if (event.request.url.match(/\.(mp3|wav|ogg)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if found
          if (response) {
            return response;
          }
          
          // Otherwise, fetch from network and don't cache
          return fetch(event.request).catch(error => {
            console.error('[Service Worker] Audio fetch failed:', error);
            // Return a fallback empty audio response
            return new Response(null, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
          });
        })
    );
    return;
  }
  
  // For all other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request and cache the response
        return fetch(fetchRequest)
          .then(response => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('[Service Worker] Cache put failed:', error);
              });
              
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // For HTML requests, return the cached index page as a fallback
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            
            return new Response('Network error occurred', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Update service worker and remove old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Take control of all clients immediately
  self.clients.claim();
  
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old cache versions
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 