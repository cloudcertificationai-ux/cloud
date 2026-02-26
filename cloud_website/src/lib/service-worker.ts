// Service Worker registration and management utilities

export interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  // Disable service worker in development to avoid fetch errors
  if (process.env.NODE_ENV === 'development') {
    console.log('Service Worker disabled in development mode');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log('New content available, please refresh');
              config.onUpdate?.(registration);
            } else {
              // Content is cached for offline use
              console.log('Content cached for offline use');
              config.onSuccess?.(registration);
            }
          }
        });
      });

      // Handle controller change (when new SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        window.location.reload();
      });

      config.onSuccess?.(registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      config.onError?.(error as Error);
    }
  });
}

export function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.unregister();
      console.log('Service Worker unregistered');
    })
    .catch((error) => {
      console.error('Service Worker unregistration failed:', error);
    });
}

export function updateServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.update();
      console.log('Service Worker update requested');
    })
    .catch((error) => {
      console.error('Service Worker update failed:', error);
    });
}

export function skipWaiting() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.ready
    .then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
}

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

export function addOnlineListener(callback: () => void) {
  if (typeof window === 'undefined') return;
  window.addEventListener('online', callback);
}

export function addOfflineListener(callback: () => void) {
  if (typeof window === 'undefined') return;
  window.addEventListener('offline', callback);
}

export function removeOnlineListener(callback: () => void) {
  if (typeof window === 'undefined') return;
  window.removeEventListener('online', callback);
}

export function removeOfflineListener(callback: () => void) {
  if (typeof window === 'undefined') return;
  window.removeEventListener('offline', callback);
}

// Cache management utilities
export async function clearCache(cacheName?: string) {
  if (!('caches' in window)) return;

  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

export async function getCacheSize(): Promise<number> {
  if (!('caches' in window)) return 0;

  let totalSize = 0;
  const cacheNames = await caches.keys();

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

export function formatCacheSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Performance monitoring integration
export function reportCachePerformance(cacheName: string, hit: boolean, responseTime: number) {
  if (typeof window === 'undefined') return;

  // Report to analytics or performance monitoring service
  if ('gtag' in window) {
    (window as any).gtag('event', 'cache_performance', {
      cache_name: cacheName,
      cache_hit: hit,
      response_time: responseTime,
    });
  }

  // Store for background sync if offline
  if (!navigator.onLine) {
    const performanceData = {
      type: 'cache_performance',
      cacheName,
      hit,
      responseTime,
      timestamp: Date.now(),
    };

    // Store in IndexedDB or localStorage for later sync
    try {
      const stored = localStorage.getItem('pending_performance_data');
      const data = stored ? JSON.parse(stored) : [];
      data.push(performanceData);
      localStorage.setItem('pending_performance_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to store performance data:', error);
    }
  }
}