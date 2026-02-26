/**
 * Heartbeat retry queue for handling failed progress updates
 * Stores failed heartbeats in localStorage and retries when connectivity is restored
 */

interface HeartbeatData {
  lessonId: string;
  currentPosition: number;
  duration: number;
  timestamp: number;
}

const QUEUE_KEY = 'heartbeat_retry_queue';
const MAX_QUEUE_SIZE = 100;
const RETRY_INTERVAL = 5000; // 5 seconds

export class HeartbeatQueue {
  private retryTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  /**
   * Add a failed heartbeat to the retry queue
   */
  enqueue(heartbeat: Omit<HeartbeatData, 'timestamp'>): void {
    if (typeof window === 'undefined') return;

    try {
      const queue = this.getQueue();
      
      // Add timestamp
      const heartbeatWithTimestamp: HeartbeatData = {
        ...heartbeat,
        timestamp: Date.now(),
      };

      // Add to queue (maintain chronological order)
      queue.push(heartbeatWithTimestamp);

      // Limit queue size (remove oldest if exceeds limit)
      if (queue.length > MAX_QUEUE_SIZE) {
        queue.shift();
      }

      this.saveQueue(queue);
      
      // Start retry timer if not already running
      this.startRetryTimer();
    } catch (error) {
      console.error('Failed to enqueue heartbeat:', error);
    }
  }

  /**
   * Process the retry queue
   */
  async processQueue(
    sendHeartbeat: (lessonId: string, position: number, duration: number) => Promise<void>
  ): Promise<void> {
    if (typeof window === 'undefined' || this.isProcessing) return;

    this.isProcessing = true;

    try {
      const queue = this.getQueue();
      
      if (queue.length === 0) {
        this.stopRetryTimer();
        return;
      }

      // Process heartbeats in chronological order
      const successfulIndices: number[] = [];

      for (let i = 0; i < queue.length; i++) {
        const heartbeat = queue[i];
        
        try {
          await sendHeartbeat(
            heartbeat.lessonId,
            heartbeat.currentPosition,
            heartbeat.duration
          );
          
          // Mark as successful
          successfulIndices.push(i);
        } catch (error) {
          // Stop processing on first failure (likely still offline)
          console.warn('Failed to send queued heartbeat, will retry later:', error);
          break;
        }
      }

      // Remove successfully sent heartbeats
      if (successfulIndices.length > 0) {
        const remainingQueue = queue.filter((_, index) => !successfulIndices.includes(index));
        this.saveQueue(remainingQueue);
        
        console.log(`Processed ${successfulIndices.length} queued heartbeats`);
      }

      // Stop timer if queue is empty
      if (this.getQueue().length === 0) {
        this.stopRetryTimer();
      }
    } catch (error) {
      console.error('Error processing heartbeat queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get the current queue from localStorage
   */
  private getQueue(): HeartbeatData[] {
    if (typeof window === 'undefined') return [];

    try {
      const queueJson = localStorage.getItem(QUEUE_KEY);
      if (!queueJson) return [];
      
      return JSON.parse(queueJson) as HeartbeatData[];
    } catch (error) {
      console.error('Failed to read heartbeat queue:', error);
      return [];
    }
  }

  /**
   * Save the queue to localStorage
   */
  private saveQueue(queue: HeartbeatData[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save heartbeat queue:', error);
    }
  }

  /**
   * Start the retry timer
   */
  private startRetryTimer(): void {
    if (this.retryTimer) return;

    this.retryTimer = setInterval(() => {
      // Timer will trigger processQueue to be called by the consumer
    }, RETRY_INTERVAL);
  }

  /**
   * Stop the retry timer
   */
  private stopRetryTimer(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
  }

  /**
   * Clear the queue (useful for testing or manual intervention)
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(QUEUE_KEY);
      this.stopRetryTimer();
    } catch (error) {
      console.error('Failed to clear heartbeat queue:', error);
    }
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.getQueue().length;
  }

  /**
   * Check if queue has items
   */
  hasItems(): boolean {
    return this.size() > 0;
  }

  /**
   * Cleanup (call on unmount)
   */
  cleanup(): void {
    this.stopRetryTimer();
  }
}

// Singleton instance
let heartbeatQueueInstance: HeartbeatQueue | null = null;

export function getHeartbeatQueue(): HeartbeatQueue {
  if (!heartbeatQueueInstance) {
    heartbeatQueueInstance = new HeartbeatQueue();
  }
  return heartbeatQueueInstance;
}
