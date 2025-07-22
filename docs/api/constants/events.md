# Event Constants

Predefined event names and categories for consistent tracking.

## Standard Events

### User Actions

```typescript
export const USER_EVENTS = {
  // Authentication
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Profile
  PROFILE_VIEW: 'profile_view',
  PROFILE_UPDATE: 'profile_update',
  AVATAR_CHANGE: 'avatar_change',

  // Account
  PASSWORD_RESET: 'password_reset',
  PASSWORD_CHANGE: 'password_change',
  EMAIL_VERIFY: 'email_verify',
  ACCOUNT_DELETE: 'account_delete',

  // Preferences
  SETTINGS_UPDATE: 'settings_update',
  NOTIFICATION_TOGGLE: 'notification_toggle',
  PRIVACY_UPDATE: 'privacy_update',
} as const;
```

### Navigation Events

```typescript
export const NAVIGATION_EVENTS = {
  // Page/Screen
  PAGE_VIEW: 'page_view',
  SCREEN_VIEW: 'screen_view',
  TAB_CHANGE: 'tab_change',

  // Navigation
  LINK_CLICK: 'link_click',
  BUTTON_CLICK: 'button_click',
  MENU_CLICK: 'menu_click',
  BACK_BUTTON: 'back_button',

  // Search
  SEARCH: 'search',
  SEARCH_RESULT_CLICK: 'search_result_click',
  FILTER_APPLY: 'filter_apply',
  SORT_CHANGE: 'sort_change',
} as const;
```

### Engagement Events

```typescript
export const ENGAGEMENT_EVENTS = {
  // Content
  CONTENT_VIEW: 'content_view',
  CONTENT_SHARE: 'content_share',
  CONTENT_SAVE: 'content_save',
  CONTENT_LIKE: 'content_like',
  CONTENT_COMMENT: 'content_comment',

  // Media
  VIDEO_START: 'video_start',
  VIDEO_PAUSE: 'video_pause',
  VIDEO_COMPLETE: 'video_complete',
  AUDIO_START: 'audio_start',
  AUDIO_COMPLETE: 'audio_complete',

  // Interaction
  FORM_START: 'form_start',
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_SPENT: 'time_spent',
} as const;
```

## E-commerce Events

### Product Events

```typescript
export const PRODUCT_EVENTS = {
  // Discovery
  PRODUCT_VIEW: 'product_view',
  PRODUCT_LIST_VIEW: 'product_list_view',
  PRODUCT_SEARCH: 'product_search',
  PRODUCT_FILTER: 'product_filter',

  // Interaction
  PRODUCT_CLICK: 'product_click',
  PRODUCT_ZOOM: 'product_zoom',
  PRODUCT_SHARE: 'product_share',
  PRODUCT_COMPARE: 'product_compare',

  // Reviews
  REVIEW_VIEW: 'review_view',
  REVIEW_SUBMIT: 'review_submit',
  REVIEW_HELPFUL: 'review_helpful',
} as const;
```

### Cart Events

```typescript
export const CART_EVENTS = {
  // Cart Actions
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  UPDATE_CART: 'update_cart',
  VIEW_CART: 'view_cart',
  CLEAR_CART: 'clear_cart',

  // Wishlist
  ADD_TO_WISHLIST: 'add_to_wishlist',
  REMOVE_FROM_WISHLIST: 'remove_from_wishlist',
  MOVE_TO_CART: 'move_to_cart',

  // Promotions
  COUPON_APPLY: 'coupon_apply',
  COUPON_REMOVE: 'coupon_remove',
  DISCOUNT_APPLY: 'discount_apply',
} as const;
```

### Checkout Events

```typescript
export const CHECKOUT_EVENTS = {
  // Checkout Flow
  BEGIN_CHECKOUT: 'begin_checkout',
  CHECKOUT_PROGRESS: 'checkout_progress',
  ADD_SHIPPING_INFO: 'add_shipping_info',
  ADD_PAYMENT_INFO: 'add_payment_info',

  // Purchase
  PURCHASE: 'purchase',
  PURCHASE_CANCEL: 'purchase_cancel',
  REFUND: 'refund',

  // Post-Purchase
  ORDER_TRACK: 'order_track',
  ORDER_CANCEL: 'order_cancel',
  RETURN_REQUEST: 'return_request',
} as const;
```

## App Events

### Lifecycle Events

```typescript
export const LIFECYCLE_EVENTS = {
  // App
  APP_OPEN: 'app_open',
  APP_CLOSE: 'app_close',
  APP_BACKGROUND: 'app_background',
  APP_FOREGROUND: 'app_foreground',
  APP_UPDATE: 'app_update',
  APP_CRASH: 'app_crash',

  // Session
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  SESSION_TIMEOUT: 'session_timeout',
} as const;
```

### Feature Events

```typescript
export const FEATURE_EVENTS = {
  // Onboarding
  TUTORIAL_START: 'tutorial_start',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  TUTORIAL_SKIP: 'tutorial_skip',

  // Features
  FEATURE_USE: 'feature_use',
  FEATURE_DISCOVER: 'feature_discover',
  FEATURE_UPGRADE: 'feature_upgrade',

  // Permissions
  PERMISSION_REQUEST: 'permission_request',
  PERMISSION_GRANT: 'permission_grant',
  PERMISSION_DENY: 'permission_deny',
} as const;
```

## Social Events

```typescript
export const SOCIAL_EVENTS = {
  // Sharing
  SHARE: 'share',
  SHARE_COMPLETE: 'share_complete',
  SHARE_CANCEL: 'share_cancel',

  // Social Actions
  FOLLOW: 'follow',
  UNFOLLOW: 'unfollow',
  BLOCK: 'block',
  UNBLOCK: 'unblock',

  // Communication
  MESSAGE_SEND: 'message_send',
  MESSAGE_RECEIVE: 'message_receive',
  CALL_START: 'call_start',
  CALL_END: 'call_end',

  // Invites
  INVITE_SEND: 'invite_send',
  INVITE_ACCEPT: 'invite_accept',
  REFERRAL_COMPLETE: 'referral_complete',
} as const;
```

## Marketing Events

```typescript
export const MARKETING_EVENTS = {
  // Campaigns
  CAMPAIGN_VIEW: 'campaign_view',
  CAMPAIGN_CLICK: 'campaign_click',
  CAMPAIGN_DISMISS: 'campaign_dismiss',

  // Email
  EMAIL_OPEN: 'email_open',
  EMAIL_CLICK: 'email_click',
  EMAIL_UNSUBSCRIBE: 'email_unsubscribe',

  // Push Notifications
  PUSH_RECEIVE: 'push_receive',
  PUSH_OPEN: 'push_open',
  PUSH_DISMISS: 'push_dismiss',

  // Ads
  AD_VIEW: 'ad_view',
  AD_CLICK: 'ad_click',
  AD_SKIP: 'ad_skip',
  AD_COMPLETE: 'ad_complete',
} as const;
```

## Event Categories

```typescript
export const EVENT_CATEGORIES = {
  USER: 'user',
  NAVIGATION: 'navigation',
  ENGAGEMENT: 'engagement',
  ECOMMERCE: 'ecommerce',
  PRODUCT: 'product',
  CART: 'cart',
  CHECKOUT: 'checkout',
  APP: 'app',
  FEATURE: 'feature',
  SOCIAL: 'social',
  MARKETING: 'marketing',
  SYSTEM: 'system',
  ERROR: 'error',
  PERFORMANCE: 'performance',
} as const;
```

## Event Properties

### Common Properties

```typescript
export const COMMON_PROPERTIES = {
  // Identifiers
  USER_ID: 'user_id',
  SESSION_ID: 'session_id',
  DEVICE_ID: 'device_id',

  // Context
  TIMESTAMP: 'timestamp',
  PLATFORM: 'platform',
  VERSION: 'version',
  LANGUAGE: 'language',

  // Location
  COUNTRY: 'country',
  REGION: 'region',
  CITY: 'city',

  // Source
  SOURCE: 'source',
  MEDIUM: 'medium',
  CAMPAIGN: 'campaign',
  REFERRER: 'referrer',
} as const;
```

### E-commerce Properties

```typescript
export const ECOMMERCE_PROPERTIES = {
  // Product
  PRODUCT_ID: 'product_id',
  PRODUCT_NAME: 'product_name',
  PRODUCT_CATEGORY: 'product_category',
  PRODUCT_BRAND: 'product_brand',
  PRODUCT_VARIANT: 'product_variant',

  // Pricing
  PRICE: 'price',
  CURRENCY: 'currency',
  QUANTITY: 'quantity',
  DISCOUNT: 'discount',
  TAX: 'tax',
  SHIPPING: 'shipping',
  TOTAL: 'total',

  // Order
  ORDER_ID: 'order_id',
  TRANSACTION_ID: 'transaction_id',
  PAYMENT_METHOD: 'payment_method',
  COUPON_CODE: 'coupon_code',
} as const;
```

## Event Validation

### Required Properties

```typescript
export const REQUIRED_PROPERTIES: Record<string, string[]> = {
  [CHECKOUT_EVENTS.PURCHASE]: ['order_id', 'total', 'currency'],
  [CART_EVENTS.ADD_TO_CART]: ['product_id', 'quantity'],
  [USER_EVENTS.SIGN_UP]: ['method'],
  [USER_EVENTS.LOGIN]: ['method'],
  [PRODUCT_EVENTS.PRODUCT_VIEW]: ['product_id'],
};
```

### Property Types

```typescript
export const PROPERTY_TYPES: Record<string, 'string' | 'number' | 'boolean'> = {
  [ECOMMERCE_PROPERTIES.PRICE]: 'number',
  [ECOMMERCE_PROPERTIES.QUANTITY]: 'number',
  [ECOMMERCE_PROPERTIES.TOTAL]: 'number',
  [COMMON_PROPERTIES.TIMESTAMP]: 'string',
  [COMMON_PROPERTIES.USER_ID]: 'string',
};
```

## Usage Examples

### Basic Usage

```typescript
import { USER_EVENTS, COMMON_PROPERTIES } from 'unified-tracking/constants';

// Track login
await tracking.track(USER_EVENTS.LOGIN, {
  [COMMON_PROPERTIES.SOURCE]: 'email',
  method: 'password',
});
```

### E-commerce Tracking

```typescript
import { CHECKOUT_EVENTS, ECOMMERCE_PROPERTIES } from 'unified-tracking/constants';

// Track purchase
await tracking.track(CHECKOUT_EVENTS.PURCHASE, {
  [ECOMMERCE_PROPERTIES.ORDER_ID]: 'ORD-123',
  [ECOMMERCE_PROPERTIES.TOTAL]: 99.99,
  [ECOMMERCE_PROPERTIES.CURRENCY]: 'USD',
  [ECOMMERCE_PROPERTIES.PAYMENT_METHOD]: 'credit_card',
  items: [
    {
      [ECOMMERCE_PROPERTIES.PRODUCT_ID]: 'PROD-456',
      [ECOMMERCE_PROPERTIES.QUANTITY]: 2,
      [ECOMMERCE_PROPERTIES.PRICE]: 49.99,
    },
  ],
});
```

### Type-safe Event Tracking

```typescript
// Create type-safe event function
function trackEvent<T extends keyof typeof ALL_EVENTS>(eventName: T, properties?: Record<string, any>): Promise<void> {
  // Validate required properties
  const required = REQUIRED_PROPERTIES[eventName];
  if (required) {
    for (const prop of required) {
      if (!properties?.[prop]) {
        throw new Error(`Missing required property: ${prop}`);
      }
    }
  }

  return tracking.track(eventName, properties);
}
```

## Best Practices

1. **Use Constants**: Always use predefined constants instead of string literals
2. **Consistent Naming**: Follow the established naming patterns
3. **Required Properties**: Always include required properties for events
4. **Type Safety**: Use TypeScript to ensure type safety
5. **Documentation**: Document custom events that aren't in the constants

## See Also

- [Provider Constants](./providers.md) - Provider-specific constants
- [Error Constants](./errors.md) - Error tracking constants
- [Event Interfaces](../interfaces/event-interfaces.md) - Event type definitions
