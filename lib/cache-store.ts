/**
 * In-memory cache store for system-wide data
 *
 * Note: This cache persists across requests within the same Node.js process.
 * In production with multiple server instances, consider using Redis or similar.
 */

import { APIResponse } from "@/lib/types";

// Cache storage
let systemSetupCache: APIResponse | null = null;
let systemSetupCacheTime: number | null = null;

/**
 * Get cached system setup data
 * @returns Cached data or null if not cached
 */
export function getCachedSystemSetup(): APIResponse | null {
  return systemSetupCache;
}

/**
 * Set system setup cache
 * @param data - The data to cache
 */
export function setCachedSystemSetup(data: APIResponse): void {
  systemSetupCache = data;
  systemSetupCacheTime = Date.now();
}

/**
 * Clear system setup cache
 * Call this when you need to force a refresh
 */
export function clearSystemSetupCache(): void {
  systemSetupCache = null;
  systemSetupCacheTime = null;
}

/**
 * Check if cache is stale based on TTL
 * @param ttlMs - Time to live in milliseconds (default: 1 hour)
 * @returns true if cache exists and is still fresh
 */
export function isSystemSetupCacheFresh(ttlMs: number = 60 * 60 * 1000): boolean {
  if (!systemSetupCache || !systemSetupCacheTime) {
    return false;
  }

  const age = Date.now() - systemSetupCacheTime;
  return age < ttlMs;
}

/**
 * Get cache metadata
 */
export function getSystemSetupCacheInfo() {
  return {
    isCached: systemSetupCache !== null,
    cachedAt: systemSetupCacheTime,
    age: systemSetupCacheTime ? Date.now() - systemSetupCacheTime : null
  };
}
