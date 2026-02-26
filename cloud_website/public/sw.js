// Anywheredoor Service Worker
// Provides offline functionality and advanced caching strategies

const CACHE_NAME = 'anywheredoor-v1';
const STATIC_CACHE_NAME = 'anywheredoor-static-v1';
const DYNAMIC_CACHE_NAME = 'anywheredoor-dynamic-v1';
const IMAGE_CACHE_NAME = 'anywheredoor-images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/courses',
  '/about',
  '/contact',
  '/instructors',
  '/offline',
  '/_next/static/css/',
  '/_next/static/js/',
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  // Static assets - cache first
  static: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100,
  },
  // API responses - network first with fallback
  api: {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50,
  },
  // Images - cache first with long expiry
  images: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 200,
  },
  // Pages - stale while revalidate
  pages: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 50,
  },
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Static assets - cache first
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE_NAME, CACHE_STRATEGIES.static);
    }
    
    // Images - cache first with long expiry
    if (isImage(url)) {
      return await cacheFirst(request, IMAGE_CACHE_NAME, CACHE_STRATEGIES.images);
    }
    
    // API routes - network first with cache fallback
    if (isApiRoute(url)) {
      return await networkFirst(request, DYNAMIC_CACHE_NAME, CACHE_STRATEGIES.api);
    }
    
    // Pages - stale while revalidate
    if (isPageRoute(url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE_NAME, CACHE_STRATEGIES.pages);
    }
    
    // Default - network only
    return await fetch(request);
    
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName, strategy) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0);
    const now = new Date();
    
    if (now - cacheTime < strategy.maxAge) {
      return cachedResponse;
    }
  }
  
  // Fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });
      
      await cache.put(request, modifiedResponse);
      await cleanupCache(cache, strategy.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if available
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network first strategy
async function networkFirst(request, cacheName, strategy) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });
      
      await cache.put(request, modifiedResponse);
      await cleanupCache(cache, strategy.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName, strategy) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network in background
  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        const headers = new Headers(responseToCache.headers);
        headers.set('sw-cache-time', new Date().toISOString());
        
        const modifiedResponse = new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers: headers,
        });
        
        await cache.put(request, modifiedResponse);
        await cleanupCache(cache, strategy.maxEntries);
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network response if no cache
  return await networkPromise || new Response('Offline', { status: 503 });
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.woff');
}

function isImage(url) {
  return url.pathname.startsWith('/_next/image') ||
         url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i);
}

function isApiRoute(url) {
  return url.pathname.startsWith('/api/');
}

function isPageRoute(url) {
  return url.pathname === '/' ||
         url.pathname.startsWith('/courses') ||
         url.pathname.startsWith('/instructors') ||
         url.pathname === '/about' ||
         url.pathname === '/contact';
}

async function cleanupCache(cache, maxEntries) {
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    const keysToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Background sync for analytics and performance data
self.addEventListener('sync', (event) => {
  if (event.tag === 'performance-sync') {
    event.waitUntil(syncPerformanceData());
  }
});

async function syncPerformanceData() {
  try {
    // Sync any queued performance data when online
    const performanceData = await getStoredPerformanceData();
    if (performanceData.length > 0) {
      await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(performanceData),
      });
      await clearStoredPerformanceData();
    }
  } catch (error) {
    console.error('Failed to sync performance data:', error);
  }
}

async function getStoredPerformanceData() {
  // Implementation would depend on IndexedDB or other storage
  return [];
}

async function clearStoredPerformanceData() {
  // Implementation would depend on IndexedDB or other storage
}

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache(event.data.url));
  }
});

async function updateCache(url) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    await cache.delete(url);
    await cache.add(url);
  } catch (error) {
    console.error('Failed to update cache for:', url, error);
  }
}