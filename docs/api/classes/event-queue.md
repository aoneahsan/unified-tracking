# EventQueue Class

Manages event queuing and batching for optimized network usage.

## Overview

`EventQueue` provides a robust event queuing system with batching, retry logic, and persistence support. It ensures events are reliably delivered even in cases of network failures or app restarts.

## Class Definition

```typescript
export class EventQueue {
  private queue: QueuedEvent[] = [];
  private processing: boolean = false;
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(options?: EventQueueOptions);

  add(event: QueuedEvent): void;
  flush(): Promise<void>;
  clear(): void;
  size(): number;
  getEvents(): QueuedEvent[];
  pause(): void;
  resume(): void;
  setProcessor(processor: EventProcessor): void;
}
```

## Constructor

```typescript
constructor(options?: EventQueueOptions)
```

### Parameters

- `options` (optional): Configuration options for the queue

### EventQueueOptions

```typescript
interface EventQueueOptions {
  maxSize?: number; // Maximum queue size (default: 1000)
  batchSize?: number; // Events per batch (default: 50)
  flushInterval?: number; // Auto-flush interval in ms (default: 30000)
  retryLimit?: number; // Max retry attempts (default: 3)
  persistence?: boolean; // Enable persistence (default: true)
  storageKey?: string; // Storage key for persistence
  processor?: EventProcessor; // Event processor function
}
```

### Example

```typescript
const queue = new EventQueue({
  maxSize: 500,
  batchSize: 25,
  flushInterval: 15000,
  retryLimit: 5,
});
```

## Types

### QueuedEvent

```typescript
interface QueuedEvent {
  id: string;
  type: 'track' | 'identify' | 'error' | 'revenue' | 'screen';
  timestamp: string;
  data: any;
  retryCount?: number;
  providerId?: string;
}
```

### EventProcessor

```typescript
type EventProcessor = (events: QueuedEvent[]) => Promise<void>;
```

## Methods

### add()

Add an event to the queue.

```typescript
add(event: QueuedEvent): void
```

#### Parameters

- `event`: Event to add to the queue

#### Example

```typescript
queue.add({
  id: generateId(),
  type: 'track',
  timestamp: new Date().toISOString(),
  data: {
    eventName: 'button_clicked',
    properties: { button: 'submit' },
  },
});
```

### flush()

Manually flush the queue.

```typescript
flush(): Promise<void>
```

#### Returns

Promise that resolves when flush is complete.

#### Example

```typescript
await queue.flush();
console.log('All events processed');
```

### clear()

Clear all events from the queue.

```typescript
clear(): void
```

#### Example

```typescript
queue.clear();
console.log('Queue cleared');
```

### size()

Get the current queue size.

```typescript
size(): number
```

#### Returns

Number of events in the queue.

#### Example

```typescript
console.log(`Queue contains ${queue.size()} events`);
```

### getEvents()

Get a copy of all queued events.

```typescript
getEvents(): QueuedEvent[]
```

#### Returns

Array of queued events.

#### Example

```typescript
const events = queue.getEvents();
console.log(`First event: ${events[0]?.type}`);
```

### pause()

Pause automatic processing.

```typescript
pause(): void
```

#### Example

```typescript
queue.pause();
// Events will still be added but not processed
```

### resume()

Resume automatic processing.

```typescript
resume(): void
```

#### Example

```typescript
queue.resume();
// Processing will continue
```

### setProcessor()

Set or update the event processor function.

```typescript
setProcessor(processor: EventProcessor): void
```

#### Parameters

- `processor`: Function to process batches of events

#### Example

```typescript
queue.setProcessor(async (events) => {
  await sendEventsToServer(events);
});
```

## Complete Implementation Example

```typescript
import { EventQueue, QueuedEvent } from 'unified-tracking';

class AnalyticsQueue extends EventQueue {
  private apiEndpoint: string;

  constructor(apiEndpoint: string) {
    super({
      maxSize: 1000,
      batchSize: 50,
      flushInterval: 30000,
      retryLimit: 3,
      persistence: true,
      storageKey: 'analytics_queue',
    });

    this.apiEndpoint = apiEndpoint;

    // Set up the processor
    this.setProcessor(this.processEvents.bind(this));

    // Load persisted events
    this.loadPersistedEvents();
  }

  private async processEvents(events: QueuedEvent[]): Promise<void> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Events processed successfully
      this.removeProcessedEvents(events);
    } catch (error) {
      console.error('Failed to process events:', error);

      // Handle retry logic
      this.handleFailedEvents(events);
      throw error; // Re-throw to trigger retry
    }
  }

  private removeProcessedEvents(events: QueuedEvent[]): void {
    const eventIds = new Set(events.map((e) => e.id));

    // Remove from queue
    const remaining = this.getEvents().filter((e) => !eventIds.has(e.id));
    this.clear();
    remaining.forEach((e) => this.add(e));

    // Update persistence
    this.persistEvents();
  }

  private handleFailedEvents(events: QueuedEvent[]): void {
    events.forEach((event) => {
      event.retryCount = (event.retryCount || 0) + 1;

      if (event.retryCount < 3) {
        // Re-add to queue for retry
        this.add(event);
      } else {
        console.error('Event exceeded retry limit:', event);
        // Could store in a dead letter queue
      }
    });
  }

  private loadPersistedEvents(): void {
    try {
      const stored = localStorage.getItem('analytics_queue');
      if (stored) {
        const events: QueuedEvent[] = JSON.parse(stored);
        events.forEach((event) => this.add(event));
      }
    } catch (error) {
      console.error('Failed to load persisted events:', error);
    }
  }

  private persistEvents(): void {
    try {
      const events = this.getEvents();
      localStorage.setItem('analytics_queue', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to persist events:', error);
    }
  }
}
```

## Advanced Features

### 1. Priority Queue

```typescript
class PriorityEventQueue extends EventQueue {
  private priorityQueue: Map<number, QueuedEvent[]> = new Map();

  addWithPriority(event: QueuedEvent, priority: number = 0): void {
    if (!this.priorityQueue.has(priority)) {
      this.priorityQueue.set(priority, []);
    }

    this.priorityQueue.get(priority)!.push(event);
    this.scheduleFlush();
  }

  protected getNextBatch(size: number): QueuedEvent[] {
    const batch: QueuedEvent[] = [];

    // Get events in priority order (higher priority first)
    const priorities = Array.from(this.priorityQueue.keys()).sort((a, b) => b - a);

    for (const priority of priorities) {
      const events = this.priorityQueue.get(priority) || [];
      const needed = size - batch.length;

      if (needed <= 0) break;

      const taken = events.splice(0, needed);
      batch.push(...taken);

      if (events.length === 0) {
        this.priorityQueue.delete(priority);
      }
    }

    return batch;
  }
}
```

### 2. Offline Support

```typescript
class OfflineAwareQueue extends EventQueue {
  private online: boolean = navigator.onLine;

  constructor(options?: EventQueueOptions) {
    super(options);

    // Monitor online status
    window.addEventListener('online', () => {
      this.online = true;
      this.flush(); // Flush when back online
    });

    window.addEventListener('offline', () => {
      this.online = false;
    });
  }

  async flush(): Promise<void> {
    if (!this.online) {
      console.log('Offline - deferring flush');
      return;
    }

    return super.flush();
  }
}
```

### 3. Compression

```typescript
class CompressedEventQueue extends EventQueue {
  private async compressEvents(events: QueuedEvent[]): Promise<string> {
    const json = JSON.stringify(events);

    // Use CompressionStream API if available
    if ('CompressionStream' in window) {
      const blob = new Blob([json]);
      const stream = blob.stream().pipeThrough(new CompressionStream('gzip'));
      const compressed = await new Response(stream).blob();
      return compressed.text();
    }

    // Fallback to no compression
    return json;
  }

  protected async processEvents(events: QueuedEvent[]): Promise<void> {
    const compressed = await this.compressEvents(events);

    await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
      body: compressed,
    });
  }
}
```

## Best Practices

1. **Batch Size**: Balance between latency and efficiency
2. **Persistence**: Enable for critical events
3. **Retry Logic**: Implement exponential backoff
4. **Memory Management**: Set reasonable max queue size
5. **Error Handling**: Handle processor errors gracefully
6. **Monitoring**: Track queue size and processing times

## Performance Considerations

```typescript
class OptimizedEventQueue extends EventQueue {
  private metrics = {
    eventsProcessed: 0,
    batchesProcessed: 0,
    averageProcessingTime: 0,
    failedBatches: 0,
  };

  async flush(): Promise<void> {
    const startTime = Date.now();
    const batchSize = this.size();

    try {
      await super.flush();

      this.metrics.eventsProcessed += batchSize;
      this.metrics.batchesProcessed++;

      const processingTime = Date.now() - startTime;
      this.updateAverageProcessingTime(processingTime);
    } catch (error) {
      this.metrics.failedBatches++;
      throw error;
    }
  }

  private updateAverageProcessingTime(newTime: number): void {
    const total = this.metrics.averageProcessingTime * (this.metrics.batchesProcessed - 1) + newTime;
    this.metrics.averageProcessingTime = total / this.metrics.batchesProcessed;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
```

## See Also

- [Batching Settings](../interfaces/core-interfaces.md#batchingsettings) - Configuration options
- [Performance Guide](../../advanced/performance.md) - Performance optimization
- [Logger Class](./logger.md) - Logging support
