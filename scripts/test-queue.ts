import "dotenv/config";
import { resumeQueue } from "../lib/queue/queues";

async function main() {
  console.log("🧪 Testing Queue Connection...");

  try {
    // 1. Check Redis status if possible (internal access)
    // process.env.UPSTASH_REDIS_URL is needed

    console.log("Attempting to add 'test-connection' job...");
    const job = await resumeQueue.add("test-connection", {
      timestamp: new Date().toISOString(),
    });

    console.log(`✅ Job added successfully! Job ID: ${job.id}`);
    console.log(
      "Check your worker terminal. You should see a '[Worker] Received test-connection job' message.",
    );
  } catch (error) {
    console.error("❌ Failed to add job to queue:", error);
  } finally {
    process.exit(0);
  }
}

main();
