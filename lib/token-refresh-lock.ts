/**
 * Token Refresh Lock
 *
 * Ensures only one token refresh happens at a time across the entire application.
 * Multiple requests waiting for a refresh share the same Promise to avoid redundant calls.
 *
 * This solves the race condition where concurrent requests all trigger token refresh simultaneously.
 */

class TokenRefreshLock {
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;

  /**
   * Check if a token refresh is currently in progress
   */
  isRefreshInProgress(): boolean {
    return this.isRefreshing;
  }

  /**
   * Acquire the lock and execute a function atomically.
   *
   * If a refresh is already in progress, wait for and return the same Promise.
   * This ensures multiple concurrent requests share the same refresh operation.
   *
   * @param fn - The async function to execute while holding the lock
   * @returns Promise with the result of the function
   */
  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    // If already refreshing, wait for the existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise as Promise<T>;
    }

    // Set flag and create promise
    this.isRefreshing = true;

    try {
      // Create promise that will be shared with waiting requests
      this.refreshPromise = fn();
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Release the lock
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }
}

// Global singleton instance
export const tokenRefreshLock = new TokenRefreshLock();
