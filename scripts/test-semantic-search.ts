/**
 * Test script for semantic search API
 *
 * Prerequisites:
 * 1. Dev server running (npm run dev)
 * 2. Redis running
 * 3. At least one resume processed through RAG pipeline
 * 4. User authenticated in session
 *
 * Usage:
 * npx tsx scripts/test-semantic-search.ts
 */

import { prisma } from "@/lib/prisma";
import { semanticSearch } from "@/lib/rag/retrieval";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { getCachedEmbedding } from "@/lib/cache/redis";
import crypto from "crypto";

async function testSemanticSearch() {
  console.log("🧪 Testing Semantic Search Implementation\n");

  try {
    // 1. Check database setup
    console.log("1️⃣ Checking database setup...");
    const embeddingCount = await prisma.embedding.count();
    const resumeCount = await prisma.resume.count();
    const userCount = await prisma.user.count();

    console.log(`   ✅ Found ${embeddingCount} embeddings`);
    console.log(`   ✅ Found ${resumeCount} resumes`);
    console.log(`   ✅ Found ${userCount} users\n`);

    if (embeddingCount === 0) {
      console.log(
        "   ⚠️  No embeddings found. Please run the RAG pipeline first:",
      );
      console.log("   npx tsx scripts/trigger-rag.ts\n");
      return;
    }

    // 2. Get a test company
    console.log("2️⃣ Finding test company...");
    const company = await prisma.company.findFirst({
      select: { id: true, name: true },
    });

    if (!company) {
      console.log("   ❌ No company found. Please create a company first.\n");
      return;
    }

    console.log(`   ✅ Using company: ${company.name} (${company.id})\n`);

    // 3. Test semantic search
    console.log("3️⃣ Testing semantic search function...");
    const startTime = Date.now();

    const results = await semanticSearch({
      query: "software engineer with React experience",
      companyId: company.id,
      filters: {
        onlyApplicants: false,
      },
      limit: 5,
    });

    const searchTime = Date.now() - startTime;
    console.log(`   ✅ Search completed in ${searchTime}ms`);
    console.log(`   ✅ Found ${results.length} candidates\n`);

    if (results.length > 0) {
      console.log("   📊 Top Results:");
      results.slice(0, 3).forEach((result, idx) => {
        console.log(
          `   ${idx + 1}. ${result.name} (Score: ${result.matchScore}/100)`,
        );
        console.log(`      📧 ${result.email}`);
        console.log(
          `      📝 ${result.relevantChunks.length} relevant chunks\n`,
        );
      });
    }

    // 4. Test rate limiting
    console.log("4️⃣ Testing rate limiter...");
    await resetRateLimit(`search:${company.id}`);

    const rateLimit1 = await checkRateLimit(`search:${company.id}`, 20, 60);
    console.log(
      `   ✅ First request: allowed=${rateLimit1.allowed}, remaining=${rateLimit1.remaining}/20`,
    );

    const rateLimit2 = await checkRateLimit(`search:${company.id}`, 20, 60);
    console.log(
      `   ✅ Second request: allowed=${rateLimit2.allowed}, remaining=${rateLimit2.remaining}/20\n`,
    );

    // 5. Test embedding cache
    console.log("5️⃣ Testing embedding cache...");
    const testText = "This is a test for caching embeddings";
    const contentHash = crypto
      .createHash("sha256")
      .update(testText)
      .digest("hex");

    const cached = await getCachedEmbedding(contentHash);
    if (cached) {
      console.log(
        `   ✅ Cache hit for test embedding (${cached.length} dims)\n`,
      );
    } else {
      console.log(
        `   ℹ️  No cache entry for test text (expected on first run)\n`,
      );
    }

    // 6. Test audit logging
    console.log("6️⃣ Checking audit logs...");
    const recentLogs = await prisma.candidateAccessLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        Accessor: { select: { name: true } },
        Company: { select: { name: true } },
      },
    });

    console.log(`   ✅ Found ${recentLogs.length} recent access logs`);
    if (recentLogs.length > 0) {
      recentLogs.forEach((log, idx) => {
        console.log(
          `   ${idx + 1}. ${log.actionType} by ${log.Accessor.name} (${log.Company?.name})`,
        );
      });
    }
    console.log();

    // 7. Performance check
    console.log("7️⃣ Performance Assessment:");
    if (searchTime < 1000) {
      console.log(`   ✅ Search time: ${searchTime}ms (Target: < 1000ms)`);
    } else {
      console.log(`   ⚠️  Search time: ${searchTime}ms (Target: < 1000ms)`);
      console.log(`   💡 Consider adding HNSW index for better performance`);
    }
    console.log();

    console.log("✅ All tests completed successfully!\n");
    console.log("📝 Next Steps:");
    console.log(
      "   1. Test API endpoint: POST /api/candidates/semantic-search",
    );
    console.log("   2. Upload more resumes to test with larger dataset");
    console.log("   3. Proceed to Week 4: Match Report Generation\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("   Error details:", error.message);
      console.error("   Stack trace:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSemanticSearch();
