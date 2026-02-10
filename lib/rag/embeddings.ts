import { generateEmbedding } from "@/app/actions/gemini";
import crypto from "crypto";
import { prisma } from "../prisma";

/**
 * Generate embeddings for chunks with aggressive caching
 * @param chunkIds - Array of chunk IDs to embed
 */
export async function embedChunks(chunkIds: string[]): Promise<void> {
  const chunks = await prisma.documentChunk.findMany({
    where: { id: { in: chunkIds } },
  });

  for (const chunk of chunks) {
    const contentHash = crypto
      .createHash("sha256")
      .update(chunk.chunkText)
      .digest("hex");

    const cached = await getCachedEmbedding(contentHash);

    if (cached) {
      const id = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "Embedding" ("id", "chunkId", "vector", "contentHash", "modelVersionId", "metadata", "createdAt")
        VALUES (${id}, ${chunk.id}, ${JSON.stringify(cached.vector)}::vector, ${contentHash}, ${cached.modelVersionId}, ${JSON.stringify({ cachedFrom: cached.id })}::jsonb, NOW())
      `;
      console.log(`[Embeddings] Cache hit for chunk ${chunk.id}`);
    } else {
      const vector = await embedText(chunk.chunkText);
      const id = crypto.randomUUID();
      const metadata = {
        tokens: Math.ceil(chunk.chunkText.length / 4),
        generatedAt: new Date().toISOString(),
      };

      await prisma.$executeRaw`
        INSERT INTO "Embedding" ("id", "chunkId", "vector", "contentHash", "modelVersionId", "metadata", "createdAt")
        VALUES (${id}, ${chunk.id}, ${JSON.stringify(vector)}::vector, ${contentHash}, ${"text-embedding-004-v1"}, ${JSON.stringify(metadata)}::jsonb, NOW())
      `;
      console.log(`[Embeddings] Generated new embedding for chunk ${chunk.id}`);

      // Track cost
      await trackEmbeddingCost(chunk.chunkText.length);
    }
  }
}

/**
 * Generate embedding for a single text using Gemini API
 * @param text - Text to embed
 * @returns Embedding vector (768 dimensions for text-embedding-004)
 */
export async function embedText(text: string): Promise<number[]> {
  try {
    const embedding = await generateEmbedding(text);
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Get cached embedding by content hash
 * @param contentHash - SHA-256 hash of chunk text
 * @returns Cached embedding or null
 */
async function getCachedEmbedding(
  contentHash: string,
): Promise<{ id: string; vector: number[]; modelVersionId: string } | null> {
  // Prisma doesn't support reading Unsupported types directly in findFirst
  const result = await prisma.$queryRaw<
    Array<{ id: string; vector: string; modelVersionId: string }>
  >`
    SELECT id, vector::text, "modelVersionId"
    FROM "Embedding"
    WHERE "contentHash" = ${contentHash}
    AND "modelVersionId" = 'text-embedding-004-v1'
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;

  if (result.length > 0) {
    const row = result[0];
    return {
      id: row.id,
      vector: JSON.parse(row.vector),
      modelVersionId: row.modelVersionId,
    };
  }

  return null;
}

/**
 * Batch embed multiple texts (up to 100)
 * @param texts - Array of texts to embed
 * @returns Array of embedding vectors
 */
export async function batchEmbedTexts(texts: string[]): Promise<number[][]> {
  // Google Embedding API supports batch requests
  // For now, process sequentially (optimize in V1)
  const embeddings: number[][] = [];

  for (const text of texts) {
    const embedding = await embedText(text);
    embeddings.push(embedding);
  }

  return embeddings;
}

/**
 * Track embedding generation cost
 * @param textLength - Length of text in characters
 */
async function trackEmbeddingCost(textLength: number): Promise<void> {
  // text-embedding-004 pricing: ~$0.00001 per 1000 tokens
  const tokens = Math.ceil(textLength / 4);
  const costUsd = (tokens / 1000) * 0.00001;

  // Log to RAGMetrics table
  await prisma.rAGMetrics.create({
    data: {
      metricType: "EMBEDDING_GENERATION_COST_USD",
      metricValue: costUsd,
      metadata: {
        tokens,
        model: "text-embedding-004",
        timestamp: new Date().toISOString(),
      },
    },
  });
}
