/**
 * Cron Route for Data Cleanup Jobs
 * Trigger this endpoint daily via Vercel Cron or external service like cron-job.org
 *
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { cleanupQueue } from "@/lib/queue/queues";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Enqueue cleanup jobs
    await cleanupQueue.add("cleanup", { taskType: "expired-matches" });
    await cleanupQueue.add("cleanup", { taskType: "old-access-logs" });
    await cleanupQueue.add("cleanup", { taskType: "old-resume-versions" });

    return NextResponse.json({
      success: true,
      message: "Cleanup jobs enqueued",
    });
  } catch (error) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to enqueue cleanup jobs" },
      { status: 500 },
    );
  }
}
