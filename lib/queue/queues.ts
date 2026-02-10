import { Queue } from "bullmq";
import { Redis } from "ioredis";

// Create IORedis connection for BullMQ (BullMQ requires ioredis, not @upstash/redis)
// Create IORedis connection for BullMQ (BullMQ requires ioredis, not @upstash/redis)
const redisUrl = process.env.UPSTASH_REDIS_URL;
let host = "localhost";
let port = 6379;

if (redisUrl) {
  try {
    const parsed = new URL(redisUrl);
    host = parsed.hostname;
    port = parsed.port ? parseInt(parsed.port) : 6379;
  } catch (e) {
    console.error("Invalid Redis URL:", e);
  }
}

const connection = new Redis({
  host,
  port,
  password: process.env.UPSTASH_REDIS_TOKEN,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Resume Processing Queue
 * Jobs: parse, chunk, embed
 */
export const resumeQueue = new Queue("resume-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 1000, // Keep last 1000 completed jobs
    removeOnFail: 5000, // Keep last 5000 failed jobs
  },
});

/**
 * Candidate Scoring Queue
 * Jobs: score-candidate (match report generation)
 */
export const scoringQueue = new Queue("candidate-scoring", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "linear",
      delay: 5000,
    },
    removeOnComplete: 500,
    removeOnFail: 2000,
  },
});

/**
 * Data Cleanup Queue
 * Jobs: expired-matches, old-access-logs, old-resume-versions
 */
export const cleanupQueue = new Queue("data-cleanup", {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

// Log queue initialization
console.log(
  "✅ BullMQ queues initialized: resume-processing, candidate-scoring, data-cleanup",
);
