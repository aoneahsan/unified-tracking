# Event Types

Type definitions for events and event-related data structures.

## Event Base Types

### BaseEvent

Base structure for all events.

```typescript
interface BaseEvent {
  timestamp: string;
  sessionId?: string;
  userId?: string;
  anonymousId?: string;
  context?: EventContext;
}
```

### EventContext

Context information attached to events.

```typescript
interface EventContext {
  app?: {
    name?: string;
    version?: string;
    build?: string;
    namespace?: string;
  };
  device?: {
    id?: string;
    manufacturer?: string;
    model?: string;
    name?: string;
    type?: string;
    version?: string;
  };
  os?: {
    name?: string;
    version?: string;
  };
  screen?: {
    width?: number;
    height?: number;
    density?: number;
  };
  locale?: string;
  timezone?: string;
  userAgent?: string;
  ip?: string;
  referrer?: string;
  campaign?: CampaignInfo;
  location?: LocationInfo;
}
```

## Tracking Event Types

### CustomEvent

Custom tracking event.

```typescript
interface CustomEvent extends BaseEvent {
  type: 'track';
  event: string;
  properties?: Record<string, any>;
}
```

### IdentifyEvent

User identification event.

```typescript
interface IdentifyEvent extends BaseEvent {
  type: 'identify';
  userId: string;
  traits?: UserTraits;
  previousId?: string;
}
```

### ScreenEvent

Screen view event.

```typescript
interface ScreenEvent extends BaseEvent {
  type: 'screen';
  name: string;
  category?: string;
  properties?: Record<string, any>;
}
```

### PageEvent

Page view event (web-specific).

```typescript
interface PageEvent extends BaseEvent {
  type: 'page';
  name?: string;
  category?: string;
  properties?: {
    title?: string;
    url?: string;
    path?: string;
    hash?: string;
    search?: string;
    referrer?: string;
    [key: string]: any;
  };
}
```

### AliasEvent

User aliasing event.

```typescript
interface AliasEvent extends BaseEvent {
  type: 'alias';
  userId: string;
  previousId: string;
}
```

### GroupEvent

Group association event.

```typescript
interface GroupEvent extends BaseEvent {
  type: 'group';
  groupId: string;
  traits?: Record<string, any>;
}
```

## Commerce Event Types

### ProductEvent

Product interaction event.

```typescript
interface ProductEvent extends BaseEvent {
  type: 'track';
  event: ProductEventName;
  properties: ProductEventProperties;
}

type ProductEventName =
  | 'Product Viewed'
  | 'Product List Viewed'
  | 'Product Added'
  | 'Product Removed'
  | 'Cart Viewed'
  | 'Checkout Started'
  | 'Checkout Step Viewed'
  | 'Checkout Step Completed'
  | 'Payment Info Entered'
  | 'Order Completed'
  | 'Order Updated'
  | 'Order Refunded'
  | 'Order Cancelled'
  | 'Coupon Entered'
  | 'Coupon Applied'
  | 'Coupon Denied'
  | 'Coupon Removed'
  | 'Product Shared'
  | 'Cart Shared'
  | 'Product Reviewed'
  | 'Product Added to Wishlist'
  | 'Product Removed from Wishlist';
```

### ProductEventProperties

Properties for product events.

```typescript
interface ProductEventProperties {
  product_id?: string;
  sku?: string;
  category?: string;
  name?: string;
  brand?: string;
  variant?: string;
  price?: number;
  quantity?: number;
  coupon?: string;
  currency?: string;
  position?: number;
  value?: number;
  revenue?: number;
  order_id?: string;
  shipping?: number;
  tax?: number;
  discount?: number;
  affiliation?: string;
  checkout_id?: string;
  step?: number;
  option?: string;
  list_id?: string;
  list?: string;
  products?: Product[];
}
```

### Product

Product data structure.

```typescript
interface Product {
  product_id?: string;
  sku?: string;
  category?: string;
  name?: string;
  brand?: string;
  variant?: string;
  price?: number;
  quantity?: number;
  coupon?: string;
  position?: number;
  url?: string;
  image_url?: string;
}
```

## Error Event Types

### ErrorEvent

Error tracking event.

```typescript
interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: {
    message: string;
    type?: string;
    stacktrace?: StackFrame[];
  };
  severity?: Severity;
  handled?: boolean;
  source?: ErrorSource;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  breadcrumbs?: Breadcrumb[];
}
```

### StackFrame

Stack trace frame.

```typescript
interface StackFrame {
  filename?: string;
  function?: string;
  lineno?: number;
  colno?: number;
  abs_path?: string;
  context_line?: string;
  pre_context?: string[];
  post_context?: string[];
  in_app?: boolean;
  vars?: Record<string, any>;
}
```

### ErrorSource

Source of the error.

```typescript
type ErrorSource = 'logger' | 'exception' | 'unhandledrejection' | 'onerror' | 'manual';
```

## User Event Types

### UserTraits

User properties/traits.

```typescript
interface UserTraits {
  // Standard traits
  email?: string;
  name?: string;
  username?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  age?: number;

  // Address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  // Company
  company?: {
    name?: string;
    id?: string;
    industry?: string;
    employeeCount?: number;
    plan?: string;
  };

  // Subscription
  plan?: string;
  createdAt?: string;

  // Custom traits
  [key: string]: any;
}
```

### UserContext

User context for error tracking.

```typescript
interface UserContext {
  id?: string;
  username?: string;
  email?: string;
  ipAddress?: string;
  segment?: string;
  [key: string]: any;
}
```

## Campaign Types

### CampaignInfo

Marketing campaign information.

```typescript
interface CampaignInfo {
  name?: string;
  source?: string;
  medium?: string;
  term?: string;
  content?: string;
}
```

### ReferrerInfo

Referrer information.

```typescript
interface ReferrerInfo {
  type?: 'search' | 'social' | 'email' | 'direct' | 'unknown';
  name?: string;
  url?: string;
  link?: string;
}
```

## Location Types

### LocationInfo

Geographic location information.

```typescript
interface LocationInfo {
  city?: string;
  country?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  speed?: number;
}
```

## Timing Event Types

### TimingEvent

Performance timing event.

```typescript
interface TimingEvent extends BaseEvent {
  type: 'timing';
  category: string;
  variable: string;
  value: number;
  label?: string;
}
```

### PerformanceMetrics

Performance metrics data.

```typescript
interface PerformanceMetrics {
  // Navigation timing
  dns?: number;
  tcp?: number;
  request?: number;
  response?: number;
  domLoading?: number;
  domInteractive?: number;
  domContentLoaded?: number;
  loadComplete?: number;

  // Resource timing
  resources?: ResourceTiming[];

  // Custom metrics
  custom?: Record<string, number>;
}
```

### ResourceTiming

Resource loading metrics.

```typescript
interface ResourceTiming {
  name: string;
  type: 'script' | 'css' | 'img' | 'font' | 'xhr' | 'other';
  duration: number;
  size?: number;
  cached?: boolean;
}
```

## Event Validation Types

### EventSchema

Schema for event validation.

```typescript
interface EventSchema {
  type: EventType;
  required?: string[];
  properties?: Record<string, PropertySchema>;
  additionalProperties?: boolean;
}
```

### PropertySchema

Schema for event properties.

```typescript
interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  enum?: any[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}
```

## Event Processing Types

### EventBatch

Batch of events for processing.

```typescript
interface EventBatch {
  events: QueuedEvent[];
  batchId: string;
  createdAt: Date;
  attempts: number;
  lastAttempt?: Date;
  error?: Error;
}
```

### EventProcessor

Function to process events.

```typescript
type EventProcessor = (events: QueuedEvent[]) => Promise<ProcessingResult>;
```

### ProcessingResult

Result of event processing.

```typescript
interface ProcessingResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: ProcessingError[];
}
```

### ProcessingError

Error during event processing.

```typescript
interface ProcessingError {
  eventId: string;
  error: Error;
  timestamp: Date;
  retryable: boolean;
}
```

## Type Guards

### Event Type Guards

```typescript
function isTrackEvent(event: BaseEvent): event is CustomEvent {
  return event.type === 'track';
}

function isIdentifyEvent(event: BaseEvent): event is IdentifyEvent {
  return event.type === 'identify';
}

function isErrorEvent(event: BaseEvent): event is ErrorEvent {
  return event.type === 'error';
}

function isCommerceEvent(event: CustomEvent): boolean {
  const commerceEvents = [
    'Product Viewed',
    'Product Added',
    'Order Completed',
    // ... other commerce events
  ];
  return commerceEvents.includes(event.event);
}
```

## Usage Examples

### Creating Events

```typescript
// Custom event
const customEvent: CustomEvent = {
  type: 'track',
  event: 'Button Clicked',
  properties: {
    button_id: 'submit-form',
    button_text: 'Submit',
    page: 'checkout',
  },
  timestamp: new Date().toISOString(),
  userId: 'user-123',
  sessionId: 'session-456',
};

// Error event
const errorEvent: ErrorEvent = {
  type: 'error',
  error: {
    message: 'Failed to load user data',
    type: 'NetworkError',
    stacktrace: [
      {
        filename: 'api.js',
        function: 'fetchUser',
        lineno: 42,
        colno: 15,
      },
    ],
  },
  severity: 'error',
  handled: true,
  source: 'manual',
  timestamp: new Date().toISOString(),
};
```

### Event Validation

```typescript
function validateEvent(event: BaseEvent, schema: EventSchema): boolean {
  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in event)) {
        return false;
      }
    }
  }

  // Validate properties
  if (schema.properties && 'properties' in event) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const value = event.properties?.[key];
      if (!validateProperty(value, propSchema)) {
        return false;
      }
    }
  }

  return true;
}
```

## See Also

- [Core Types](./core-types.md) - Basic type definitions
- [Provider Types](./provider-types.md) - Provider-specific types
- [Event Interfaces](../interfaces/event-interfaces.md) - Event interfaces
