// Quick test to check if Redis is accessible
import Redis from "ioredis";

const redis = new Redis("redis://127.0.0.1:6379");

redis.on("connect", () => {
  console.log("✅ Successfully connected to Redis!");
  redis.ping((err, result) => {
    if (err) {
      console.error("❌ Ping failed:", err);
    } else {
      console.log("✅ Ping result:", result);
    }
    redis.disconnect();
    process.exit(0);
  });
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error("❌ Connection timeout");
  redis.disconnect();
  process.exit(1);
}, 5000);
