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

  const paramsArray: any[] = [JSON.stringify(queryEmbedding)];
  const pushParam = (value: unknown) => {
    paramsArray.push(value);
    return `$${paramsArray.length}`;
  };

  const companyIdParam = pushParam(companyId);
  const jobFilterClause = jobId ? `AND a."jobId" = ${pushParam(jobId)}` : "";

  // Note: minExperience is currently not reliably derivable from parsed resume text.
  const locationFilterClause = filters?.location
    ? `AND dc."chunkText" ILIKE ${pushParam(`%${filters.location.trim()}%`)}`
    : "";

  const skills = (filters?.skills || []).filter(Boolean);
  const skillsFilterClause = skills.length
    ? `AND (${skills
        .map((skill) => `dc."chunkText" ILIKE ${pushParam(`%${skill}%`)}`)
        .join(" OR ")})`
    : "";

  const limitParam = pushParam(limit);
  const offsetParam = pushParam(offset);

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
        r.url as resume_url,
        r."userId" as candidate_id,
        u.name as candidate_name,
        u.email as candidate_email,
        a."createdAt" as applied_at
      FROM "Embedding" e
      INNER JOIN "DocumentChunk" dc ON e."chunkId" = dc.id
      INNER JOIN "ParsedDocument" pd ON dc."parsedDocId" = pd.id
      INNER JOIN "Resume" r ON pd."resumeId" = r.id
      INNER JOIN "Application" a ON a."resumeId" = r.id
      INNER JOIN "Job" j ON j.id = a."jobId" AND j."companyId" = ${companyIdParam}
      INNER JOIN "User" u ON r."userId" = u.id
      WHERE 1=1
        ${jobFilterClause}
        ${locationFilterClause}
        ${skillsFilterClause}
      ORDER BY similarity DESC
      LIMIT ${limitParam}
      OFFSET ${offsetParam}
    ),
    grouped_results AS (
      SELECT 
        candidate_id,
        candidate_name,
        candidate_email,
        "resumeId",
        resume_url,
        MAX(applied_at) as applied_at,
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
               "resumeId", resume_url
    )
    SELECT * FROM grouped_results
    ORDER BY avg_similarity DESC
    LIMIT ${limitParam};
  `;

  // 4. Execute query
  const results = await prisma.$queryRawUnsafe(sql, ...paramsArray);

  // 5. Transform and calculate match scores (0-100 scale)
  return (results as any[]).map((row) => ({
    candidateId: row.candidate_id,
    resumeId: row.resumeId,
    resumeUrl: row.resume_url || undefined,
    matchScore: Math.max(0, Math.min(100, Math.round(row.avg_similarity * 100))),
    name: row.candidate_name || "Unknown Candidate",
    email: row.candidate_email,
    relevantChunks: (row.relevant_chunks || []).slice(0, 5),
    appliedAt: row.applied_at ? new Date(row.applied_at) : undefined,
  }));
}
