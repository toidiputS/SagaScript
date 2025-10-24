// Service Worker for SagaScript Profile Page Caching
const CACHE_NAME = 'sagascript-profile-v1';
const PROFILE_CACHE_NAME = 'sagascript-profile-data-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/profile',
  // Add common profile assets here
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/profile',
  '/api/user/stats',
  '/api/profile/recent-activity',
  '/api/achievements',
  '/api/user-achievements',
  '/api/user/subscription',
  '/api/user/usage',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== PROFILE_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (url.pathname.startsWith('/profile')) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle image assets
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isCacheableApi = CACHEABLE_APIS.some(api => url.pathname.startsWith(api));

  if (!isCacheableApi) {
    return fetch(request);
  }

  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(PROFILE_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response if no cache available
    return new Response(JSON.stringify({ error: 'Offline and no cached data available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return a basic offline page for profile routes
    if (request.url.includes('/profile')) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Profile - Offline</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
              <h1>You're offline</h1>
              <p>Please check your internet connection and try again.</p>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    throw error;
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return a placeholder image for failed image loads
    return new Response(
      `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#f3f4f6"/>
        <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#9ca3af">Image</text>
      </svg>`,
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// Background sync for profile updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'profile-update') {
    event.waitUntil(syncProfileUpdates());
  }
});

// Sync profile updates when back online
async function syncProfileUpdates() {
  // This would handle any pending profile updates
  // Implementation depends on your offline update strategy
  console.log('Syncing profile updates...');
}

// Handle push notifications for profile-related updates
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    if (data.type === 'profile-update') {
      event.waitUntil(
        self.registration.showNotification(data.title, {
          body: data.body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'profile-update'
        })
      );
    }
  }
});