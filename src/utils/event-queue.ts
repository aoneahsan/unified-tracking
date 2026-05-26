export interface QueuedEvent {
  id: string;
  timestamp: number;
  type: 'track' | 'identify' | 'error' | 'revenue' | 'screenView' | 'userProperties';
  data: Record<string, unknown>;
  retryCount: number;
}

export class EventQueue {
  private static instance: EventQueue;
  private queue: QueuedEvent[] = [];
  private processing = false;
  private maxRetries = 3;
  private batchSize = 10;
  private maxQueueSize = 1000;
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
    if (this.intervalId !== undefined || typeof window === 'undefined') {
      return;
    }

    this.intervalId = window.setInterval(() => {
      void this.flush();
    }, this.flushInterval);

    // Process any queued events immediately
    void this.flush();
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

    // Cap the queue so a long offline burst can't grow it toward the storage quota.
    if (this.queue.length > this.maxQueueSize) {
      this.queue.splice(0, this.queue.length - this.maxQueueSize);
    }

    this.persistEvents();

    // If queue is getting large, flush immediately
    if (this.queue.length >= this.batchSize * 2) {
      void this.flush();
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
      const results = await Promise.allSettled(this.listeners.map((listener) => listener(batch)));

      // If ANY listener rejected, re-queue the batch ONCE — incrementing retryCount and
      // dropping events past maxRetries. Previously each event was re-queued once per
      // failed listener, duplicating it; now each event is re-queued at most once.
      // Re-added at the front (preserving relative order) so retries precede newer events.
      // NOTE: listeners are broadcast the same batch, so listeners must be idempotent.
      const anyListenerFailed = results.some((result) => result.status === 'rejected');
      if (anyListenerFailed) {
        const failedEvents = batch
          .filter((event) => event.retryCount < this.maxRetries)
          .map((event) => ({ ...event, retryCount: event.retryCount + 1 }));
        if (failedEvents.length > 0) {
          this.queue.unshift(...failedEvents);
        }
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

  /**
   * Remove and return every queued event in FIFO order, clearing persistence. Used by
   * the core to replay events that were buffered before initialize() completed.
   */
  drain(): QueuedEvent[] {
    const events = [...this.queue];
    this.queue = [];
    this.clearPersistedEvents();
    return events;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  private generateId(): string {
    const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
    if (cryptoObj?.randomUUID) {
      return cryptoObj.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private persistEvents(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('unified_tracking_queue', JSON.stringify(this.queue));
      }
    } catch {
      // Ignore storage errors (quota, disabled storage, private mode, etc.)
    }
  }

  private loadPersistedEvents(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('unified_tracking_queue');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Trust nothing read back from storage — keep only well-shaped entries.
          this.queue = Array.isArray(parsed) ? parsed.filter((e) => e && typeof e === 'object') : [];
        }
      }
    } catch {
      // Ignore storage errors (quota, disabled storage, private mode, etc.)
    }
  }

  private clearPersistedEvents(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('unified_tracking_queue');
      }
    } catch {
      // Ignore storage errors (quota, disabled storage, private mode, etc.)
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
