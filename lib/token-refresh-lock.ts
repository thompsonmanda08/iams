/**
 * Token Refresh Lock
 *
 * Serializes token-refresh work across concurrent callers within this Node
 * process. A second caller does NOT receive the first caller's return value —
 * each caller runs its own `fn()` after the previous one settles, so callers
 * with different return types stay correct.
 *
 * The first caller's work still wins from the backend's perspective: by the
 * time the second caller's `fn()` runs, the cookie has been refreshed and
 * `verifySession()` returns the up-to-date access token. Subsequent fn()s
 * therefore see the latest state and either no-op (if they re-check expiry)
 * or perform their own cookie-coherent refresh.
 *
 * Single-instance deployment only. A multi-instance prod would need a Redis
 * or database-backed mutex (out of scope for this plan).
 */

class TokenRefreshLock {
  private chain: Promise<unknown> = Promise.resolve();
  private inFlight = 0;

  isRefreshInProgress(): boolean {
    return this.inFlight > 0;
  }

  /**
   * Run `fn` after any in-flight acquire(s) have settled. Returns the result
   * of THIS caller's `fn`, never another caller's.
   */
  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    this.inFlight++;
    // Chain off the previous tail. We swallow the previous result/error so a
    // failure from caller A does not propagate into caller B's promise.
    const next = this.chain.then(
      () => fn(),
      () => fn()
    );
    this.chain = next.catch(() => undefined);

    try {
      return await next;
    } finally {
      this.inFlight--;
    }
  }
}

// Global singleton instance
export const tokenRefreshLock = new TokenRefreshLock();
