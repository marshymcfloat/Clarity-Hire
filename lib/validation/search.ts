import { z } from "zod";

/**
 * Validation schema for semantic search requests
 */
export const SemanticSearchSchema = z.object({
  query: z
    .string()
    .min(3, "Query must be at least 3 characters")
    .max(500, "Query must be less than 500 characters"),
  jobId: z.string().cuid().optional(),
  filters: z
    .object({
      location: z.string().optional(),
      minExperience: z.number().min(0).max(50).optional(),
      skills: z
        .array(z.string())
        .max(20, "Maximum 20 skills allowed")
        .optional(),
      onlyApplicants: z.boolean().default(false),
    })
    .optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

export type SemanticSearchInput = z.infer<typeof SemanticSearchSchema>;

/**
 * Schema for individual search result
 */
export const SearchResultItemSchema = z.object({
  candidateId: z.string(),
  resumeId: z.string(),
  matchScore: z.number().min(0).max(100),
  name: z.string(),
  email: z.string().email(),
  location: z.string().optional(),
  relevantChunks: z
    .array(
      z.object({
        chunkId: z.string(),
        text: z.string(),
        sectionType: z.string().optional(),
        similarity: z.number(),
      }),
    )
    .max(5),
  appliedAt: z.date().optional(),
});

/**
 * Schema for complete search response
 */
export const SearchResultSchema = z.object({
  results: z.array(SearchResultItemSchema),
  total: z.number(),
  query: z.string(),
  executionTime: z.number(),
});

export type SearchResult = z.infer<typeof SearchResultItemSchema>;
export type SearchResponse = z.infer<typeof SearchResultSchema>;
