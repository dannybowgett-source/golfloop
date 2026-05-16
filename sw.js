// Golf Connection Service Worker v95
var CACHE = 'golf-connection-v95';

// Install: skip waiting immediately
self.addEventListener('install', function(e) {
  e.waitUntil(self.skipWaiting());
});

// Activate: delete ALL old caches and claim clients
// NOTE: do NOT force client.navigate() -- causes reload loop on iOS Safari
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) { return caches.delete(key); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: ALWAYS network-first, NO caching
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Firebase/API -- always network
  if (url.includes('storage') || url.includes('api') || url.includes('firebase') || url.includes('googleapis')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // HTML files -- never cache, always fresh
  if (url.endsWith('.html') || url.endsWith('/') || url === self.location.origin + '/') {
    e.respondWith(fetch(e.request, {cache: 'no-store'}));
    return;
  }

  // Everything else -- network first
  e.respondWith(fetch(e.request));
});
