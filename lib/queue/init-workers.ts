/**
 * Worker Initialization Script
 * Starts all BullMQ workers for background job processing
 * Run this file separately: node lib/queue/init-workers.js
 * OR deploy it as a separate background process/dyno
 */

import "dotenv/config";
import { resumeWorker, scoringWorker, cleanupWorker } from "./workers";

console.log("🚀 Starting BullMQ workers...");

// Workers start automatically when imported
console.log("✅ Resume processing worker started");
console.log("✅ Candidate scoring worker started");
console.log("✅ Data cleanup worker started");

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n📦 Shutting down workers...");
  await Promise.all([
    resumeWorker.close(),
    scoringWorker.close(),
    cleanupWorker.close(),
  ]);
  console.log("👋 Workers stopped");
  process.exit(0);
});

console.log("⏳ Workers are running. Press Ctrl+C to stop.");
