# Event Interfaces

Interfaces for event tracking and data structures.

## RevenueData

Data structure for tracking revenue events.

### Definition

```typescript
export interface RevenueData {
  /**
   * The revenue amount
   */
  amount: number;

  /**
   * Currency code (ISO 4217)
   * @example "USD", "EUR", "GBP"
   */
  currency: string;

  /**
   * Product identifier
   */
  productId?: string;

  /**
   * Product name
   */
  productName?: string;

  /**
   * Product category
   */
  category?: string;

  /**
   * Quantity of items
   * @default 1
   */
  quantity?: number;

  /**
   * Additional properties
   */
  properties?: Record<string, any>;
}
```

### Example

```typescript
const revenueData: RevenueData = {
  amount: 99.99,
  currency: 'USD',
  productId: 'SKU-123',
  productName: 'Premium Subscription',
  category: 'subscription',
  quantity: 1,
  properties: {
    couponCode: 'SAVE20',
    paymentMethod: 'credit_card',
    billingCycle: 'monthly',
  },
};
```

## ScreenViewData

Data structure for tracking screen or page views.

### Definition

```typescript
export interface ScreenViewData {
  /**
   * The name of the screen or page
   */
  screenName: string;

  /**
   * The class name of the screen (mobile)
   */
  screenClass?: string;

  /**
   * Additional properties
   */
  properties?: Record<string, any>;
}
```

### Example

```typescript
const screenView: ScreenViewData = {
  screenName: 'product-details',
  screenClass: 'ProductDetailsViewController',
  properties: {
    productId: 'PROD-456',
    category: 'electronics',
    source: 'search',
  },
};
```

## TrackingEvent

Generic event structure for custom tracking.

### Definition

```typescript
export interface TrackingEvent {
  /**
   * Event name
   */
  name: string;

  /**
   * Event properties
   */
  properties?: Record<string, any>;

  /**
   * Event timestamp (ISO 8601)
   */
  timestamp?: string;

  /**
   * User ID associated with the event
   */
  userId?: string;

  /**
   * Session ID
   */
  sessionId?: string;
}
```

### Example

```typescript
const event: TrackingEvent = {
  name: 'form_submitted',
  properties: {
    formName: 'contact',
    fields: ['email', 'message'],
    submissionTime: 1500,
  },
  timestamp: new Date().toISOString(),
  userId: 'user-123',
  sessionId: 'session-456',
};
```

## ErrorContext

Context information for error tracking.

### Definition

```typescript
export interface ErrorContext {
  /**
   * Error severity level
   */
  severity?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';

  /**
   * Tags for categorizing errors
   */
  tags?: Record<string, string>;

  /**
   * Additional context data
   */
  extra?: Record<string, any>;

  /**
   * User information at the time of error
   */
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };

  /**
   * Breadcrumbs leading to the error
   */
  breadcrumbs?: Array<{
    timestamp: string;
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, any>;
  }>;
}
```

### Example

```typescript
const errorContext: ErrorContext = {
  severity: 'error',
  tags: {
    component: 'payment',
    action: 'process-card',
    environment: 'production',
  },
  extra: {
    orderId: 'ORDER-789',
    amount: 149.99,
    attemptNumber: 3,
  },
  user: {
    id: 'user-123',
    email: 'user@example.com',
  },
  breadcrumbs: [
    {
      timestamp: '2024-01-15T10:30:00Z',
      message: 'User clicked checkout',
      category: 'navigation',
    },
    {
      timestamp: '2024-01-15T10:30:05Z',
      message: 'Payment form validated',
      category: 'validation',
    },
  ],
};
```

## UserTraits

User properties for identification.

### Definition

```typescript
export interface UserTraits {
  /**
   * User's email address
   */
  email?: string;

  /**
   * User's full name
   */
  name?: string;

  /**
   * User's username
   */
  username?: string;

  /**
   * User's phone number
   */
  phone?: string;

  /**
   * User's subscription plan
   */
  plan?: string;

  /**
   * Account creation date
   */
  createdAt?: string;

  /**
   * Custom user properties
   */
  [key: string]: any;
}
```

### Example

```typescript
const userTraits: UserTraits = {
  email: 'john.doe@example.com',
  name: 'John Doe',
  username: 'johndoe',
  plan: 'premium',
  createdAt: '2024-01-01T00:00:00Z',
  company: 'Acme Corp',
  role: 'admin',
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: true,
  },
};
```

## EventProperties

Common properties that can be attached to any event.

### Definition

```typescript
export type EventProperties = Record<
  string,
  string | number | boolean | Date | null | undefined | EventProperties | EventProperties[]
>;
```

### Usage Guidelines

1. **Naming Convention**: Use snake_case for property names
2. **Value Types**: Stick to primitive types and simple objects
3. **Avoid PII**: Don't include sensitive personal information
4. **Be Consistent**: Use the same property names across events

### Example

```typescript
const properties: EventProperties = {
  // Primitive values
  page_title: 'Product Details',
  price: 99.99,
  is_featured: true,
  published_at: new Date(),

  // Nested objects
  product: {
    id: 'PROD-123',
    name: 'Premium Widget',
    category: 'widgets',
  },

  // Arrays
  tags: ['new', 'featured', 'sale'],

  // Complex nested structure
  user_journey: {
    source: 'google',
    campaign: 'summer-sale',
    steps: ['home', 'search', 'product', 'checkout'],
  },
};
```

## See Also

- [Core Interfaces](./core-interfaces.md) - Main plugin interfaces
- [Provider Interfaces](./provider-interfaces.md) - Provider configuration interfaces
- [Configuration Interfaces](./configuration-interfaces.md) - Plugin configuration interfaces
