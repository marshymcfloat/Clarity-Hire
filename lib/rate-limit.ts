import Redis from "ioredis";

// Initialize Redis client (reuse existing connection from queue)
// Use localhost on Windows (Docker Desktop maps container ports to host)
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter?: number; // Seconds until next allowed request
}

/**
 * Sliding window rate limiter using Redis
 *
 * @param key - Unique identifier (e.g., "search:companyId:123")
 * @param limit - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds (default: 60)
 * @returns Rate limit status
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number = 60,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Use Redis sorted set to track requests by timestamp
  const rateLimitKey = `ratelimit:${key}`;

  try {
    // 1. Remove old entries outside the window
    await redis.zremrangebyscore(rateLimitKey, 0, windowStart);

    // 2. Count requests in current window
    const requestCount = await redis.zcard(rateLimitKey);

    // 3. Calculate remaining and reset time
    const remaining = Math.max(0, limit - requestCount);
    const resetTimestamp = Math.ceil((now + windowSeconds * 1000) / 1000);

    // 4. Check if limit exceeded
    if (requestCount >= limit) {
      // Get oldest request in window to calculate retry-after
      const oldestRequest = await redis.zrange(
        rateLimitKey,
        0,
        0,
        "WITHSCORES",
      );
      const oldestTimestamp =
        oldestRequest.length > 1 ? parseInt(oldestRequest[1]) : now;
      const retryAfter = Math.ceil(
        (oldestTimestamp + windowSeconds * 1000 - now) / 1000,
      );

      return {
        allowed: false,
        limit,
        remaining: 0,
        reset: resetTimestamp,
        retryAfter: Math.max(1, retryAfter),
      };
    }

    // 5. Add current request to the window
    await redis.zadd(rateLimitKey, now, `${now}:${Math.random()}`);

    // 6. Set expiry on the key (cleanup)
    await redis.expire(rateLimitKey, windowSeconds * 2);

    return {
      allowed: true,
      limit,
      remaining: remaining - 1, // -1 because we just added this request
      reset: resetTimestamp,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open - allow the request if Redis is down
    return {
      allowed: true,
      limit,
      remaining: limit,
      reset: Math.ceil((now + windowSeconds * 1000) / 1000),
    };
  }
}

/**
 * Reset rate limit for a specific key
 * Useful for testing or administrative overrides
 */
export async function resetRateLimit(key: string): Promise<void> {
  const rateLimitKey = `ratelimit:${key}`;
  await redis.del(rateLimitKey);
}
