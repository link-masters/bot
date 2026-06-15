/**
 * In-process sliding-window rate limiter.
 *
 * Works perfectly on a single server (local dev, Railway, Render).
 * On Vercel each cold-start gets a fresh counter, so it's per-instance rather
 * than truly global — good enough for abuse prevention; for strict per-user
 * global limits add Upstash Redis and replace the Map with a Redis ZADD.
 */

interface Window {
  timestamps: number[]; // hit timestamps inside the current window
  resetAt: number;      // when the oldest slot expires
}

const store = new Map<string, Window>();

// Purge stale keys every 5 minutes to prevent unbounded memory growth.
let lastPurge = Date.now();
function maybeGc() {
  const now = Date.now();
  if (now - lastPurge < 5 * 60_000) return;
  lastPurge = now;
  for (const [key, win] of store) {
    if (now > win.resetAt) store.delete(key);
  }
}

/**
 * Returns true if the request is within the allowed rate.
 * @param key     Unique key, e.g. `bots:ip:1.2.3.4` or `bots:user:abc123`
 * @param limit   Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  maybeGc();
  const now = Date.now();
  const cutoff = now - windowMs;

  const win = store.get(key);
  if (!win) {
    store.set(key, { timestamps: [now], resetAt: now + windowMs });
    return true;
  }

  // Drop timestamps outside the window (sliding window)
  win.timestamps = win.timestamps.filter((t) => t > cutoff);

  if (win.timestamps.length >= limit) return false;

  win.timestamps.push(now);
  win.resetAt = now + windowMs;
  return true;
}

export function getClientIp(req: Request): string {
  const h = req.headers as Headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Convenience: checks both IP and user-id limits.
 * Returns a 429 response string if rate-limited, null if OK.
 */
export function checkRateLimit(
  req: Request,
  namespace: string,
  userId: string | null,
  opts: { ipLimit?: number; userLimit?: number; windowMs?: number } = {}
): { limited: boolean; reason: string | null } {
  const { ipLimit = 60, userLimit = 30, windowMs = 60_000 } = opts;
  const ip = getClientIp(req);

  if (!rateLimit(`${namespace}:ip:${ip}`, ipLimit, windowMs)) {
    return { limited: true, reason: "Too many requests from this IP." };
  }
  if (userId && !rateLimit(`${namespace}:user:${userId}`, userLimit, windowMs)) {
    return { limited: true, reason: "Too many requests for this account." };
  }
  return { limited: false, reason: null };
}
