import { prisma } from "@/lib/prisma";

async function checkEmbeddings() {
  console.log("🔍 Checking RAG status...\n");

  const resumes = await prisma.resume.count();
  const parsedDocs = await prisma.parsedDocument.count();
  const chunks = await prisma.documentChunk.count();
  const embeddings = await prisma.embedding.count({
    where: {
      modelVersionId: "text-embedding-004-v1",
    },
  });

  // Check for any embeddings using raw query to be absolutely sure about pgvector data
  const vectorCheck = await prisma.$queryRaw`
    SELECT count(*) as count FROM "Embedding" WHERE vector IS NOT NULL
  `;
  const rawCount = Number((vectorCheck as any)[0].count);

  console.log(`📄 Resumes uploaded: ${resumes}`);
  console.log(`📝 Parsed documents: ${parsedDocs}`);
  console.log(`🧩 Text chunks created: ${chunks}`);
  console.log(`🧠 Embeddings generated (Prisma count): ${embeddings}`);
  console.log(`🔢 Embeddings with vector data (SQL count): ${rawCount}`);

  console.log("\n-----------------------------------");

  if (resumes > 0 && embeddings === 0) {
    console.log("⚠️  Resumes found but NO embeddings generated.");
    console.log("   Possible causes:");
    console.log("   1. Queue workers are not running");
    console.log("   2. Redis connection failed");
    console.log("   3. Parsing/Embedding API failed");
  } else if (resumes > 0 && embeddings > 0) {
    console.log("✅ RAG pipeline appears to be working!");

    // Sample one
    const sample = await prisma.embedding.findFirst({
      include: {
        DocumentChunk: {
          include: {
            ParsedDocument: {
              include: {
                Resume: true,
              },
            },
          },
        },
      },
    });

    if (sample) {
      console.log(
        `\nExample embedding for: ${sample.DocumentChunk.ParsedDocument.Resume.name}`,
      );
      console.log(
        `Chunk text preview: "${sample.DocumentChunk.chunkText.substring(0, 50)}..."`,
      );
    }
  } else {
    console.log("ℹ️  No resumes found in database.");
  }
}

checkEmbeddings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
