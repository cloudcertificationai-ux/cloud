'use client';

import React, { useEffect, useState } from 'react';
import { getOfflineManager, OfflineStatus } from '@/lib/offline-resilience';
import { OfflineBanner } from './ErrorMessage';

/**
 * OfflineDetector component that monitors network status
 * and displays offline banner when connection is lost
 */
export function OfflineDetector() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOffline: false,
    lastOnline: null,
    queuedOperations: 0,
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const manager = getOfflineManager();

    // Get initial status
    setStatus(manager.getStatus());

    // Subscribe to status changes
    const unsubscribe = manager.subscribe((newStatus) => {
      setStatus(newStatus);
      
      // Reset dismissed state when going offline
      if (newStatus.isOffline) {
        setDismissed(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetry = async () => {
    const manager = getOfflineManager();
    await manager.retryQueue();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Don't show banner if online or dismissed
  if (!status.isOffline || dismissed) {
    return null;
  }

  return (
    <OfflineBanner
      queuedOperations={status.queuedOperations}
      onRetry={handleRetry}
      onDismiss={handleDismiss}
    />
  );
}

/**
 * Hook to use offline status in components
 */
export function useOfflineStatus() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOffline: false,
    lastOnline: null,
    queuedOperations: 0,
  });

  useEffect(() => {
    const manager = getOfflineManager();

    // Get initial status
    setStatus(manager.getStatus());

    // Subscribe to status changes
    const unsubscribe = manager.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}

/**
 * Hook to queue operations when offline
 */
export function useOfflineQueue() {
  const manager = getOfflineManager();

  const queueOperation = (
    type: string,
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: any,
    headers?: Record<string, string>,
    maxRetries?: number
  ) => {
    manager.queueOperation(type, url, method, body, headers, maxRetries);
  };

  const retryQueue = async () => {
    await manager.retryQueue();
  };

  const clearQueue = () => {
    manager.clearQueue();
  };

  return {
    queueOperation,
    retryQueue,
    clearQueue,
  };
}

export default OfflineDetector;
