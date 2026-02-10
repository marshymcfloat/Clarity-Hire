import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { chunkResume, embedChunks, parseResume } from "../rag";
import { prisma } from "../prisma";

// Redis connection for workers
// Redis connection for workers
const redisUrl = process.env.UPSTASH_REDIS_URL;
let host = "localhost";
let port = 6379;

if (redisUrl) {
  try {
    const parsed = new URL(redisUrl);
    host = parsed.hostname;
    // Upstash Redis usually runs on 6379 for TCP, even if URL is https
    port = parsed.port ? parseInt(parsed.port) : 6379;
  } catch (e) {
    console.error("Invalid Redis URL:", e);
  }
}

const connection = new Redis({
  host,
  port,
  password: process.env.UPSTASH_REDIS_TOKEN,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Resume Parsing Worker
 * Handles: parse, chunk, embed jobs
 */
export const resumeWorker = new Worker(
  "resume-processing",
  async (job: Job) => {
    const { name, data } = job;

    try {
      switch (name) {
        case "parse": {
          const { resumeId, resumeUrl, fileType } = data;
          console.log(`[Worker] Parsing resume ${resumeId}...`);

          // Parse resume to extract text
          const rawText = await parseResume(resumeUrl, fileType || "pdf");

          // Generate content hash
          const crypto = require("crypto");
          const textHash = crypto
            .createHash("sha256")
            .update(rawText)
            .digest("hex");

          // Save parsed document
          const parsedDoc = await prisma.parsedDocument.create({
            data: {
              resumeId,
              rawText,
              textHash,
              metadata: {
                parsedAt: new Date().toISOString(),
                source: "pdf-parse",
              },
            },
          });

          console.log(`[Worker] Resume parsed successfully: ${parsedDoc.id}`);

          // Enqueue chunking job
          const { resumeQueue } = await import("./queues");
          await resumeQueue.add("chunk", { parsedDocId: parsedDoc.id });

          return { parsedDocId: parsedDoc.id };
        }

        case "chunk": {
          const { parsedDocId } = data;
          console.log(`[Worker] Chunking document ${parsedDocId}...`);

          // Load parsed document
          const doc = await prisma.parsedDocument.findUnique({
            where: { id: parsedDocId },
          });

          if (!doc) throw new Error(`ParsedDocument ${parsedDocId} not found`);

          // Chunk the text
          const chunks = await chunkResume(doc.rawText, parsedDocId);

          console.log(`[Worker] Created ${chunks.length} chunks`);

          // Enqueue embedding jobs for each chunk
          const { resumeQueue } = await import("./queues");
          for (const chunk of chunks) {
            await resumeQueue.add(
              "embed",
              { chunkId: chunk.id },
              {
                jobId: `embed-${chunk.id}`, // Idempotency key
              },
            );
          }

          return { chunkCount: chunks.length };
        }

        case "embed": {
          const { chunkId } = data;
          console.log(`[Worker] Embedding chunk ${chunkId}...`);

          // Check if already embedded (idempotency)
          const existing = await prisma.embedding.findFirst({
            where: { chunkId },
          });

          if (existing) {
            console.log(`[Worker] Chunk ${chunkId} already embedded, skipping`);
            return { skipped: true };
          }

          // Generate embedding
          await embedChunks([chunkId]);

          // Check if all chunks for this resume are now embedded
          const chunk = await prisma.documentChunk.findUnique({
            where: { id: chunkId },
            include: {
              ParsedDocument: {
                include: {
                  Resume: {
                    include: {
                      Application: true,
                    },
                  },
                },
              },
            },
          });

          if (chunk?.ParsedDocument) {
            const totalChunks = await prisma.documentChunk.count({
              where: { parsedDocId: chunk.parsedDocId },
            });

            const embeddedChunks = await prisma.documentChunk.count({
              where: {
                parsedDocId: chunk.parsedDocId,
                Embedding: { isNot: null },
              },
            });

            // If all chunks embedded, mark applications as processed
            if (totalChunks === embeddedChunks) {
              const resumeId = chunk.ParsedDocument.resumeId;
              await prisma.application.updateMany({
                where: { resumeId },
                data: {
                  processedForRAG: true,
                  ragProcessedAt: new Date(),
                },
              });
              console.log(
                `[Worker] Resume ${resumeId} fully processed for RAG`,
              );
            }
          }

          return { embedded: true };
        }

        case "test-connection": {
          console.log(
            `[Worker] 🧪 Received test-connection job. Connection is WORKING!`,
          );
          return { success: true };
        }

        default:
          throw new Error(`Unknown job type: ${name}`);
      }
    } catch (error) {
      console.error(`[Worker] Error processing ${name} job:`, error);
      throw error;
    }
  },
  { connection },
);

/**
 * Candidate Scoring Worker
 * Handles: score-candidate jobs (match report generation)
 */
export const scoringWorker = new Worker(
  "candidate-scoring",
  async (job: Job) => {
    const { applicationId, jobId } = job.data;
    console.log(
      `[Worker] Scoring candidate for application ${applicationId}, job ${jobId}`,
    );

    // TODO: Implement in MVP phase (Week 4)
    // This will call generateMatchExplanation() when implemented

    return { status: "pending_mvp_implementation" };
  },
  { connection },
);

/**
 * Data Cleanup Worker
 * Handles: expired-matches, old-access-logs, old-resume-versions
 */
export const cleanupWorker = new Worker(
  "data-cleanup",
  async (job: Job) => {
    const { taskType } = job.data;
    console.log(`[Worker] Running cleanup task: ${taskType}`);

    switch (taskType) {
      case "expired-matches":
        // Delete expired match reports that aren't saved
        const deleted = await prisma.candidateJobMatch.deleteMany({
          where: {
            expiresAt: { lte: new Date() },
            isSaved: false,
          },
        });
        console.log(`[Worker] Deleted ${deleted.count} expired match reports`);
        break;

      case "old-access-logs":
        // Delete access logs older than 3 years
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
        const logsDeleted = await prisma.candidateAccessLog.deleteMany({
          where: { createdAt: { lte: threeYearsAgo } },
        });
        console.log(`[Worker] Deleted ${logsDeleted.count} old access logs`);
        break;

      case "old-resume-versions":
        // TODO: Implement when resume versioning is added
        console.log("[Worker] Resume version cleanup not yet implemented");
        break;

      default:
        console.warn(`[Worker] Unknown cleanup task: ${taskType}`);
    }

    return { taskType, completedAt: new Date() };
  },
  { connection },
);

console.log(
  "✅ BullMQ workers started: resumeWorker, scoringWorker, cleanupWorker",
);
