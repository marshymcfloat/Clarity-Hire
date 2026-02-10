import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { SemanticSearchSchema } from "@/lib/validation/search";
import { semanticSearch } from "@/lib/rag/retrieval";
import { logCandidateAccess } from "@/lib/rag/audit";
import { getRecruiterContext, JOB_MANAGEMENT_ROLES } from "@/lib/security";
import {
  getCachedSearchResults,
  setCachedSearchResults,
} from "@/lib/cache/redis";
import crypto from "crypto";

/**
 * POST /api/candidates/semantic-search
 *
 * Semantic search for candidates using natural language queries
 *
 * Rate Limit: 20 requests per minute per company
 * Auth: Requires authenticated user in a company
 *
 * Request Body:
 * {
 *   query: string,
 *   jobId?: string,
 *   filters?: {
 *     location?: string,
 *     minExperience?: number,
 *     skills?: string[],
 *     onlyApplicants?: boolean
 *   },
 *   limit?: number (default: 20, max: 50),
 *   offset?: number (default: 0)
 * }
 *
 * Response:
 * {
 *   results: SearchResult[],
 *   total: number,
 *   query: string,
 *   executionTime: number
 * }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 },
      );
    }

    // 2. Resolve recruiter/company access
    const access = await getRecruiterContext(session.user.id, {
      allowedMemberRoles: JOB_MANAGEMENT_ROLES,
    });

    if (!access.authorized) {
      return NextResponse.json(
        { error: "Forbidden", message: access.error },
        { status: 403 },
      );
    }

    // 3. Rate limiting (20 req/min per company)
    const rateLimitKey = `search:${access.companyId}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 20, 60);

    // Add rate limit headers
    const headers = {
      "X-RateLimit-Limit": rateLimit.limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.reset.toString(),
    };

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate Limit Exceeded",
          message: `Too many requests. Please try again in ${rateLimit.retryAfter} seconds.`,
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429, headers },
      );
    }

    // 4. Parse and validate request body
    const body = await req.json();
    const validation = SemanticSearchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid request parameters",
          details: validation.error.message,
        },
        { status: 400, headers },
      );
    }

    const { query, jobId, filters, limit, offset } = validation.data;

    // 5.5. Ensure job belongs to the recruiter's company when provided
    if (jobId) {
      const { prisma } = await import("@/lib/prisma");
      const job = await prisma.job.findFirst({
        where: { id: jobId, companyId: access.companyId },
        select: { id: true },
      });

      if (!job) {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "Invalid job context for your company",
          },
          { status: 403, headers },
        );
      }
    }

    // 5. Check cache (hash query + filters for cache key)
    const cacheKey = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          query,
          jobId,
          filters,
          limit,
          offset,
          companyId: access.companyId,
        }),
      )
      .digest("hex");

    const cached = await getCachedSearchResults(cacheKey);
    if (cached) {
      console.log(`[CACHE HIT] Search results for query: "${query}"`);
      return NextResponse.json(
        {
          ...cached,
          cached: true,
          executionTime: Date.now() - startTime,
        },
        { headers },
      );
    }

    // 6. Perform semantic search
    const results = await semanticSearch({
      query,
      companyId: access.companyId,
      jobId,
      filters,
      limit,
      offset,
    });

    // 7. Audit logging for GDPR compliance
    // Log each candidate that appeared in search results
    await Promise.all(
      results.map((result) =>
        logCandidateAccess({
          companyId: access.companyId,
          userId: session.user.id,
          candidateId: result.candidateId,
          action: "SEARCH",
          metadata: {
            query,
            matchScore: result.matchScore,
            jobId: jobId || null,
          },
        }),
      ),
    );

    // 8. Prepare response
    const response = {
      results,
      total: results.length,
      query,
      executionTime: Date.now() - startTime,
    };

    // 9. Cache results for 5 minutes
    await setCachedSearchResults(cacheKey, response);

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Semantic search error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        executionTime: Date.now() - startTime,
      },
      { status: 500 },
    );
  }
}
