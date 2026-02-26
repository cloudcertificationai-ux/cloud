// src/lib/offline-resilience.ts

/**
 * Operation to be queued for retry when offline
 */
export interface QueuedOperation {
  id: string;
  type: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * Offline status
 */
export interface OfflineStatus {
  isOffline: boolean;
  lastOnline: number | null;
  queuedOperations: number;
}

/**
 * Operation queue manager
 */
class OperationQueue {
  private queue: QueuedOperation[] = [];
  private readonly STORAGE_KEY = 'offline_operation_queue';
  private readonly MAX_QUEUE_SIZE = 50;

  constructor() {
    this.loadQueue();
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load operation queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save operation queue:', error);
    }
  }

  /**
   * Add operation to queue
   */
  add(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): void {
    // Check queue size limit
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      console.warn('Operation queue is full, removing oldest operation');
      this.queue.shift();
    }

    const queuedOp: QueuedOperation = {
      ...operation,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedOp);
    this.saveQueue();

    console.log(`Operation queued: ${operation.type} (${operation.method} ${operation.url})`);
  }

  /**
   * Get all queued operations
   */
  getAll(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Remove operation from queue
   */
  remove(id: string): void {
    this.queue = this.queue.filter((op) => op.id !== id);
    this.saveQueue();
  }

  /**
   * Update operation retry count
   */
  incrementRetry(id: string): void {
    const operation = this.queue.find((op) => op.id === id);
    if (operation) {
      operation.retryCount++;
      this.saveQueue();
    }
  }

  /**
   * Clear all operations
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Generate unique ID for operation
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Offline resilience manager
 */
class OfflineResilienceManager {
  private isOnline: boolean = true;
  private lastOnlineTime: number | null = null;
  private queue: OperationQueue;
  private listeners: Set<(status: OfflineStatus) => void> = new Set();
  private retryInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.queue = new OperationQueue();
    this.initializeListeners();
  }

  /**
   * Initialize online/offline event listeners
   */
  private initializeListeners(): void {
    if (typeof window === 'undefined') return;

    // Set initial online status
    this.isOnline = navigator.onLine;
    this.lastOnlineTime = this.isOnline ? Date.now() : null;

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Start retry interval if offline
    if (!this.isOnline) {
      this.startRetryInterval();
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log('Connection restored');
    this.isOnline = true;
    this.lastOnlineTime = Date.now();
    this.notifyListeners();

    // Process queued operations
    this.processQueue();

    // Stop retry interval
    this.stopRetryInterval();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('Connection lost');
    this.isOnline = false;
    this.notifyListeners();

    // Start retry interval
    this.startRetryInterval();
  }

  /**
   * Start retry interval for queued operations
   */
  private startRetryInterval(): void {
    if (this.retryInterval) return;

    // Try to process queue every 30 seconds
    this.retryInterval = setInterval(() => {
      if (navigator.onLine) {
        this.processQueue();
      }
    }, 30000);
  }

  /**
   * Stop retry interval
   */
  private stopRetryInterval(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }

  /**
   * Process queued operations
   */
  private async processQueue(): Promise<void> {
    const operations = this.queue.getAll();

    if (operations.length === 0) {
      return;
    }

    console.log(`Processing ${operations.length} queued operations`);

    for (const operation of operations) {
      try {
        // Check if max retries exceeded
        if (operation.retryCount >= operation.maxRetries) {
          console.warn(`Operation ${operation.id} exceeded max retries, removing from queue`);
          this.queue.remove(operation.id);
          continue;
        }

        // Attempt to execute operation
        const response = await fetch(operation.url, {
          method: operation.method,
          headers: {
            'Content-Type': 'application/json',
            ...operation.headers,
          },
          body: operation.body ? JSON.stringify(operation.body) : undefined,
        });

        if (response.ok) {
          console.log(`Operation ${operation.id} completed successfully`);
          this.queue.remove(operation.id);
        } else {
          console.warn(`Operation ${operation.id} failed with status ${response.status}`);
          this.queue.incrementRetry(operation.id);
        }
      } catch (error) {
        console.error(`Failed to process operation ${operation.id}:`, error);
        this.queue.incrementRetry(operation.id);
      }
    }

    this.notifyListeners();
  }

  /**
   * Queue operation for retry
   */
  queueOperation(
    type: string,
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: any,
    headers?: Record<string, string>,
    maxRetries: number = 3
  ): void {
    this.queue.add({
      type,
      url,
      method,
      body,
      headers,
      maxRetries,
    });

    this.notifyListeners();
  }

  /**
   * Get current offline status
   */
  getStatus(): OfflineStatus {
    return {
      isOffline: !this.isOnline,
      lastOnline: this.lastOnlineTime,
      queuedOperations: this.queue.size(),
    };
  }

  /**
   * Check if currently online
   */
  isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribe to status changes
   */
  subscribe(listener: (status: OfflineStatus) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in offline status listener:', error);
      }
    });
  }

  /**
   * Clear all queued operations
   */
  clearQueue(): void {
    this.queue.clear();
    this.notifyListeners();
  }

  /**
   * Manually trigger queue processing
   */
  async retryQueue(): Promise<void> {
    await this.processQueue();
  }
}

// Singleton instance
let offlineManager: OfflineResilienceManager | null = null;

/**
 * Get offline resilience manager instance
 */
export function getOfflineManager(): OfflineResilienceManager {
  if (!offlineManager) {
    offlineManager = new OfflineResilienceManager();
  }
  return offlineManager;
}

/**
 * Detect if error is a network error
 */
export function isNetworkError(error: any): boolean {
  // Check for fetch network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Check for common network error messages
  const networkErrorMessages = [
    'network',
    'offline',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'Failed to fetch',
  ];

  const errorMessage = error?.message?.toLowerCase() || '';
  return networkErrorMessages.some((msg) => errorMessage.includes(msg.toLowerCase()));
}

/**
 * Fetch with offline resilience
 */
export async function fetchWithOfflineSupport(
  url: string,
  options?: RequestInit & {
    operationType?: string;
    queueOnFailure?: boolean;
    maxRetries?: number;
  }
): Promise<Response> {
  const manager = getOfflineManager();

  // Check if online
  if (!manager.isCurrentlyOnline()) {
    // Queue operation if requested
    if (options?.queueOnFailure !== false) {
      manager.queueOperation(
        options?.operationType || 'fetch',
        url,
        (options?.method as any) || 'GET',
        options?.body,
        options?.headers as Record<string, string>,
        options?.maxRetries
      );
    }

    throw new Error('Network unavailable. Operation has been queued for retry.');
  }

  try {
    const response = await fetch(url, options);

    // If response is ok, return it
    if (response.ok) {
      return response;
    }

    // If server error and queueing is enabled, queue for retry
    if (response.status >= 500 && options?.queueOnFailure !== false) {
      manager.queueOperation(
        options?.operationType || 'fetch',
        url,
        (options?.method as any) || 'GET',
        options?.body,
        options?.headers as Record<string, string>,
        options?.maxRetries
      );
    }

    return response;
  } catch (error) {
    // If network error and queueing is enabled, queue for retry
    if (isNetworkError(error) && options?.queueOnFailure !== false) {
      manager.queueOperation(
        options?.operationType || 'fetch',
        url,
        (options?.method as any) || 'GET',
        options?.body,
        options?.headers as Record<string, string>,
        options?.maxRetries
      );
    }

    throw error;
  }
}

/**
 * Hook for using offline resilience in React components
 */
export function useOfflineResilience() {
  const manager = getOfflineManager();

  return {
    status: manager.getStatus(),
    isOnline: manager.isCurrentlyOnline(),
    queueOperation: manager.queueOperation.bind(manager),
    retryQueue: manager.retryQueue.bind(manager),
    clearQueue: manager.clearQueue.bind(manager),
    subscribe: manager.subscribe.bind(manager),
  };
}

export default {
  getOfflineManager,
  isNetworkError,
  fetchWithOfflineSupport,
  useOfflineResilience,
};
