'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker, skipWaiting, isOnline, addOnlineListener, addOfflineListener } from '@/lib/service-worker';

interface ServiceWorkerManagerProps {
  showUpdatePrompt?: boolean;
  showOfflineIndicator?: boolean;
}

export default function ServiceWorkerManager({ 
  showUpdatePrompt = true, 
  showOfflineIndicator = true 
}: ServiceWorkerManagerProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [online, setOnline] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Initialize online status
    setOnline(isOnline());

    // Register service worker
    registerServiceWorker({
      onUpdate: (reg) => {
        console.log('Service Worker update available');
        setUpdateAvailable(true);
        setRegistration(reg);
      },
      onSuccess: (reg) => {
        console.log('Service Worker registered successfully');
        setRegistration(reg);
      },
      onError: (error) => {
        console.error('Service Worker registration failed:', error);
      },
    });

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('App is online');
      setOnline(true);
    };

    const handleOffline = () => {
      console.log('App is offline');
      setOnline(false);
    };

    addOnlineListener(handleOnline);
    addOfflineListener(handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if (registration) {
      skipWaiting();
      setUpdateAvailable(false);
    }
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
  };

  return (
    <>
      {/* Update Available Notification */}
      {showUpdatePrompt && updateAvailable && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">
                  A new version of Anywheredoor is available!
                </p>
                <p className="text-xs opacity-90">
                  Update now to get the latest features and improvements.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpdate}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Update
              </button>
              <button
                onClick={dismissUpdate}
                className="text-white hover:text-blue-200 transition-colors"
                aria-label="Dismiss update notification"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {showOfflineIndicator && !online && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-yellow-600 text-white p-3 rounded-lg shadow-lg md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">You're offline</p>
              <p className="text-xs opacity-90">
                Some features may not be available
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance monitoring script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Monitor cache performance
            if ('serviceWorker' in navigator && 'performance' in window) {
              const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                  if (entry.name.includes('cache')) {
                    console.log('Cache performance:', entry);
                  }
                });
              });
              
              try {
                observer.observe({ entryTypes: ['measure', 'navigation'] });
              } catch (e) {
                console.warn('Performance observer not fully supported');
              }
            }
          `,
        }}
      />
    </>
  );
}