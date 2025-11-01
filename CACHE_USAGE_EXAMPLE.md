# System Setup Cache Usage

Two versions are available with different caching strategies.

## Version 1: `initializeSystemSetup()` - Request-Level Cache

Uses React's `cache()` for **request-level memoization**.

### How it works

1. **Within a single request**: Function is called once, result is reused for all subsequent calls
2. **Between requests**: Cache is automatically cleared - fresh data is fetched for each new request
3. **No manual revalidation needed**: Each request gets its own cache instance

### Usage

```typescript
import { initializeSystemSetup } from '@/app/_actions/auth-actions';

// First call in this request - fetches from API
const result1 = await initializeSystemSetup();

// Second call in same request - returns cached result (no API call)
const result2 = await initializeSystemSetup();

// In a new request, cache is cleared and data is fetched again
```

### Benefits

- Prevents duplicate calls within a single request
- Automatic cleanup - no stale data
- Simple to use - no manual cache management

### When to use

- When you want fresh data on each page load
- For data that changes frequently
- When simplicity is more important than performance

---

## Version 2: `initializeSystemSetupCached()` - Persistent Cache

Uses **in-memory cache** that persists across requests with manual revalidation.

### How it works

1. **First call**: Fetches from API and caches the result
2. **Subsequent calls**: Returns cached data (no API call)
3. **TTL-based expiration**: Automatically refetches after TTL expires (default: 1 hour)
4. **Manual revalidation**: Call `revalidateSystemSetup()` to force refresh

### Usage Examples

#### Basic usage (1 hour TTL)

```typescript
import { initializeSystemSetupCached } from '@/app/_actions/auth-actions';

// First call - fetches and caches
const result = await initializeSystemSetupCached();

// Subsequent calls - returns cached data
const cached = await initializeSystemSetupCached();
```

#### Custom TTL

```typescript
// Cache for 30 minutes
const result = await initializeSystemSetupCached({
  ttl: 30 * 60 * 1000
});

// Cache for 5 minutes
const result = await initializeSystemSetupCached({
  ttl: 5 * 60 * 1000
});
```

#### Force refresh

```typescript
// Bypass cache and fetch fresh data
const fresh = await initializeSystemSetupCached({
  forceRefresh: true
});
```

#### Manual revalidation

```typescript
import {
  initializeSystemSetupCached,
  revalidateSystemSetup
} from '@/app/_actions/auth-actions';

// Clear cache when configuration changes
async function updateSystemConfig(config: any) {
  const response = await updateConfig(config);

  if (response.success) {
    // Clear cache to force fresh data on next call
    await revalidateSystemSetup();
  }

  return response;
}

// Next call will fetch fresh data
const fresh = await initializeSystemSetupCached();
```

### Benefits

- Significantly reduces API calls
- Improves performance for frequently accessed data
- Full control over cache invalidation
- Configurable TTL for automatic expiration

### When to use

- For data that rarely changes (system config, settings, etc.)
- When you want to minimize API calls
- When you need control over cache invalidation
- For data shared across multiple requests

---

## Important Limitation

Due to `cookies()` usage (via `authenticatedApiClient` → `verifySession()`), Next.js `unstable_cache()` **cannot** be used:

> "Route used `cookies()` inside a function cached with `unstable_cache()`. Accessing Dynamic data sources inside a cache scope is not supported."

This is why we provide two custom implementations instead.

## Alternative Caching Strategies

### Session/Cookie Storage

For user-specific data that needs to persist across requests:

```typescript
async function initializeSystemSetup(): Promise<APIResponse> {
  const { session } = await verifySession();

  // Check if data exists in session
  if (session?.systemSetup) {
    return successResponse(session.systemSetup, "Loaded from session");
  }

  // Fetch and store in session
  const response = await authenticatedApiClient({ url: '/api/v1/auth/setup' });
  await updateAuthSession({ systemSetup: response.data });

  return successResponse(response.data, response.data?.message);
}
```

**Note**: Be mindful of cookie size limits (4KB).

### External Cache (Redis)

For production with multiple server instances:

```typescript
import redis from '@/lib/redis';

async function initializeSystemSetupRedis(): Promise<APIResponse> {
  const cacheKey = 'system:setup';

  // Try to get from Redis
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch and cache
  const response = await authenticatedApiClient({ url: '/api/v1/auth/setup' });
  const result = successResponse(response.data, response.data?.message);

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(result));

  return result;
}
```

## Recommendation

| Use Case | Solution |
|----------|----------|
| Fresh data on every page load | `initializeSystemSetup()` (React cache) |
| Rarely changing system config | `initializeSystemSetupCached()` (In-memory cache) |
| User-specific data | Session/Cookie storage |
| Multi-instance production | Redis or external cache |

## Cache Invalidation

Remember to clear the cache when data changes:

```typescript
// After updating system configuration
await updateSystemConfiguration(newConfig);
await revalidateSystemSetup(); // Clear cache

// Or use revalidatePath for full page refresh
revalidatePath('/dashboard');
```
