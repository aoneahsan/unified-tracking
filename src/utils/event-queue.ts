export interface QueuedEvent {
  id: string;
  timestamp: number;
  type: 'track' | 'identify' | 'error' | 'revenue' | 'screenView' | 'userProperties';
  data: any;
  retryCount: number;
}

export class EventQueue {
  private static instance: EventQueue;
  private queue: QueuedEvent[] = [];
  private processing = false;
  private maxRetries = 3;
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private intervalId?: number;
  private listeners: Array<(events: QueuedEvent[]) => Promise<void>> = [];
  private providerQueues = new Map<string, QueuedEvent[]>();

  private constructor() {
    // Load any persisted events
    this.loadPersistedEvents();
  }

  static getInstance(): EventQueue {
    if (!EventQueue.instance) {
      EventQueue.instance = new EventQueue();
    }
    return EventQueue.instance;
  }

  start(): void {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(() => {
      this.flush();
    }, this.flushInterval);
    
    // Process any queued events immediately
    this.flush();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  add(event: Omit<QueuedEvent, 'id' | 'timestamp' | 'retryCount'>): void {
    const queuedEvent: QueuedEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    this.queue.push(queuedEvent);
    this.persistEvents();
    
    // If queue is getting large, flush immediately
    if (this.queue.length >= this.batchSize * 2) {
      this.flush();
    }
  }

  addListener(listener: (events: QueuedEvent[]) => Promise<void>): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (events: QueuedEvent[]) => Promise<void>): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0 || this.listeners.length === 0) {
      return;
    }
    
    this.processing = true;
    
    try {
      // Get batch of events
      const batch = this.queue.splice(0, this.batchSize);
      
      // Process batch with all listeners
      const results = await Promise.allSettled(
        this.listeners.map(listener => listener(batch))
      );
      
      // Handle failed events
      const failedEvents: QueuedEvent[] = [];
      results.forEach((result) => {
        if (result.status === 'rejected') {
          // Re-queue events that failed for this listener
          batch.forEach(event => {
            if (event.retryCount < this.maxRetries) {
              failedEvents.push({
                ...event,
                retryCount: event.retryCount + 1,
              });
            }
          });
        }
      });
      
      // Re-add failed events to the front of the queue
      if (failedEvents.length > 0) {
        this.queue.unshift(...failedEvents);
      }
      
      this.persistEvents();
    } finally {
      this.processing = false;
    }
  }

  clear(): void {
    this.queue = [];
    this.clearPersistedEvents();
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private persistEvents(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('unified_tracking_queue', JSON.stringify(this.queue));
      }
    } catch (error) {
      // Ignore storage errors
    }
  }

  private loadPersistedEvents(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('unified_tracking_queue');
        if (stored) {
          this.queue = JSON.parse(stored);
        }
      }
    } catch (error) {
      // Ignore storage errors
    }
  }

  private clearPersistedEvents(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('unified_tracking_queue');
      }
    } catch (error) {
      // Ignore storage errors
    }
  }

  getEventsForProvider(providerId: string): QueuedEvent[] {
    return this.providerQueues.get(providerId) || [];
  }

  addEventForProvider(providerId: string, event: QueuedEvent): void {
    if (!this.providerQueues.has(providerId)) {
      this.providerQueues.set(providerId, []);
    }
    this.providerQueues.get(providerId)!.push(event);
  }
}