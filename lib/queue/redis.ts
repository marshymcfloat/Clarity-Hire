import { Redis } from "@upstash/redis";

// Initialize Upstash Redis connection for BullMQ
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Validate connection on module load
if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
  console.warn(
    "⚠️ UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN not found in environment variables",
  );
}

// Export for use in workers and API routes
export default redis;
