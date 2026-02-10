import Redis from "ioredis";

// Initialize Redis client
// Use localhost on Windows (Docker Desktop maps container ports to host)
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Cache TTLs
const EMBEDDING_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days
const SEARCH_RESULTS_CACHE_TTL = 60 * 5; // 5 minutes

/**
 * Get cached embedding vector by text hash
 *
 * @param contentHash - SHA-256 hash of the text
 * @returns Embedding vector or null if not cached
 */
export async function getCachedEmbedding(
  contentHash: string,
): Promise<number[] | null> {
  try {
    const cached = await redis.get(`embedding:${contentHash}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Failed to get cached embedding:", error);
    return null;
  }
}

/**
 * Cache an embedding vector
 *
 * @param contentHash - SHA-256 hash of the text
 * @param embedding - Embedding vector to cache
 */
export async function setCachedEmbedding(
  contentHash: string,
  embedding: number[],
): Promise<void> {
  try {
    await redis.setex(
      `embedding:${contentHash}`,
      EMBEDDING_CACHE_TTL,
      JSON.stringify(embedding),
    );
  } catch (error) {
    console.error("Failed to cache embedding:", error);
    // Don't throw - caching is optional
  }
}

/**
 * Get cached search results
 *
 * @param queryHash - Hash of the search query + filters
 * @returns Cached results or null
 */
export async function getCachedSearchResults(
  queryHash: string,
): Promise<any | null> {
  try {
    const cached = await redis.get(`search:${queryHash}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Failed to get cached search results:", error);
    return null;
  }
}

/**
 * Cache search results
 *
 * @param queryHash - Hash of the search query + filters
 * @param results - Search results to cache
 */
export async function setCachedSearchResults(
  queryHash: string,
  results: any,
): Promise<void> {
  try {
    await redis.setex(
      `search:${queryHash}`,
      SEARCH_RESULTS_CACHE_TTL,
      JSON.stringify(results),
    );
  } catch (error) {
    console.error("Failed to cache search results:", error);
    // Don't throw - caching is optional
  }
}

/**
 * Invalidate all search caches for a company
 * Call this when new resumes are added or updated
 *
 * @param companyId - Company ID to invalidate cache for
 */
export async function invalidateSearchCache(companyId: string): Promise<void> {
  try {
    const pattern = `search:*:${companyId}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `Invalidated ${keys.length} search cache entries for company ${companyId}`,
      );
    }
  } catch (error) {
    console.error("Failed to invalidate search cache:", error);
  }
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
  embeddingCacheSize: number;
  searchCacheSize: number;
}> {
  try {
    const [embeddingKeys, searchKeys] = await Promise.all([
      redis.keys("embedding:*"),
      redis.keys("search:*"),
    ]);

    return {
      embeddingCacheSize: embeddingKeys.length,
      searchCacheSize: searchKeys.length,
    };
  } catch (error) {
    console.error("Failed to get cache stats:", error);
    return {
      embeddingCacheSize: 0,
      searchCacheSize: 0,
    };
  }
}
