import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/app/actions/gemini";
import type { SearchResult } from "@/lib/validation/search";

export interface SemanticSearchParams {
  query: string;
  companyId: string;
  jobId?: string;
  filters?: {
    location?: string;
    minExperience?: number;
    skills?: string[];
    onlyApplicants?: boolean;
  };
  limit?: number;
  offset?: number;
}

/**
 * Perform semantic search using pgvector cosine similarity
 *
 * @param params - Search parameters including query, filters, and pagination
 * @returns Array of candidates ranked by relevance with their relevant resume chunks
 */
export async function semanticSearch(
  params: SemanticSearchParams,
): Promise<SearchResult[]> {
  const { query, companyId, jobId, filters, limit = 20, offset = 0 } = params;

  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Build dynamic SQL with pgvector cosine similarity
  // Using cosine distance operator <=> (0 = identical, 2 = opposite)
  // We convert to similarity: 1 - distance
  const sql = `
    WITH ranked_chunks AS (
      SELECT 
        e.id as embedding_id,
        e."chunkId",
        dc."chunkText",
        dc."sectionType",
        1 - (e.vector <=> $1::vector) as similarity,
        pd."resumeId",
        r."userId" as candidate_id,
        u.name as candidate_name,
        u.email as candidate_email,
        a."createdAt" as applied_at,
        a."jobId" as application_job_id
      FROM "Embedding" e
      INNER JOIN "DocumentChunk" dc ON e."chunkId" = dc.id
      INNER JOIN "ParsedDocument" pd ON dc."parsedDocId" = pd.id
      INNER JOIN "Resume" r ON pd."resumeId" = r.id
      INNER JOIN "User" u ON r."userId" = u.id
      LEFT JOIN "Application" a ON a."resumeId" = r.id ${jobId ? 'AND a."jobId" = $2' : ""}
      WHERE 1=1
        ${filters?.onlyApplicants ? "AND a.id IS NOT NULL" : ""}
      ORDER BY similarity DESC
      LIMIT $${jobId ? 3 : 2}
      OFFSET $${jobId ? 4 : 3}
    ),
    grouped_results AS (
      SELECT 
        candidate_id,
        candidate_name,
        candidate_email,
        "resumeId",
        applied_at,
        AVG(similarity) as avg_similarity,
        jsonb_agg(
          jsonb_build_object(
            'chunkId', "chunkId",
            'text', "chunkText",
            'sectionType', "sectionType",
            'similarity', similarity
          )
          ORDER BY similarity DESC
        ) FILTER (WHERE similarity > 0.7) as relevant_chunks
      FROM ranked_chunks
      GROUP BY candidate_id, candidate_name, candidate_email, 
               "resumeId", applied_at
    )
    SELECT * FROM grouped_results
    ORDER BY avg_similarity DESC
    LIMIT $${jobId ? 3 : 2};
  `;

  // 3. Build parameters array dynamically
  const params_array: any[] = [JSON.stringify(queryEmbedding)];

  if (jobId) {
    params_array.push(jobId);
  }

  params_array.push(limit);
  params_array.push(offset);

  // 4. Execute query
  const results = await prisma.$queryRawUnsafe(sql, ...params_array);

  // 5. Transform and calculate match scores (0-100 scale)
  return (results as any[]).map((row) => ({
    candidateId: row.candidate_id,
    resumeId: row.resumeId,
    matchScore: Math.round(row.avg_similarity * 100),
    name: row.candidate_name,
    email: row.candidate_email,
    relevantChunks: (row.relevant_chunks || []).slice(0, 5),
    appliedAt: row.applied_at ? new Date(row.applied_at) : undefined,
  }));
}
