/**
 * Lightweight TTL cache for server-side use.
 *
 * Reduces Appwrite API calls for hot paths like getLoggedInUser.
 * Per-process (same caveat as rate-limit.ts — Vercel instances don't share
 * memory). Pair with React's `cache()` for per-request deduplication.
 *
 * TTLs:
 *   user profile  → 30 s  (balance freshness vs latency)
 *   bot list      → 60 s  (mutated less often)
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

class TtlCache {
  private store = new Map<string, Entry<unknown>>();
  private lastGc = Date.now();

  private gc() {
    const now = Date.now();
    if (now - this.lastGc < 60_000) return;
    this.lastGc = now;
    for (const [k, e] of this.store) {
      if (now > e.expiresAt) this.store.delete(k);
    }
  }

  get<T>(key: string): T | null {
    this.gc();
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  del(key: string): void { this.store.delete(key); }

  delByPrefix(prefix: string): void {
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }
}

export const cache = new TtlCache();

export const TTL = {
  USER:  30_000,   // 30 seconds
  BOTS:  60_000,   // 60 seconds
  SHORT: 10_000,   //  10 seconds
} as const;

/** Wrap any async getter with cache-aside. */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const hit = cache.get<T>(key);
  if (hit !== null) return hit;
  const value = await fn();
  cache.set(key, value, ttlMs);
  return value;
}
