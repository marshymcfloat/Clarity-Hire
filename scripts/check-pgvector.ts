import { prisma } from "@/prisma/prisma";


async function checkPgvector() {
  console.log("🔍 Checking pgvector extension...\n");

  try {
    // Check if pgvector extension is installed
    const result = (await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `) as any[];

    if (result.length > 0) {
      console.log("✅ pgvector extension is INSTALLED");
      console.log("   Version:", result[0].extversion || "unknown");
      console.log("   Schema:", result[0].extnamespace || "public");
    } else {
      console.log("❌ pgvector extension is NOT installed");
      console.log("\n📝 To install pgvector, run this SQL:");
      console.log("   CREATE EXTENSION IF NOT EXISTS vector;");
      console.log(
        "\nOr contact your database provider (Prisma.io) to enable pgvector.\n",
      );
    }

    // Check if Embedding table exists and has vector column
    console.log("\n🔍 Checking Embedding table structure...\n");

    const columns = (await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'Embedding' AND column_name = 'vector';
    `) as any[];

    if (columns.length > 0) {
      const col = columns[0];
      console.log("✅ Embedding.vector column found");
      console.log("   Data type:", col.data_type);
      console.log("   UDT name:", col.udt_name);

      if (col.udt_name === "vector") {
        console.log("   ✅ Column is using pgvector type!");
      } else {
        console.log(
          "   ⚠️  Column is NOT using pgvector type (expected: vector, got:",
          col.udt_name + ")",
        );
        console.log("   Run: npx prisma migrate dev --name fix_vector_type");
      }
    } else {
      console.log("❌ Embedding.vector column not found");
      console.log("   Run: npx prisma migrate dev");
    }
  } catch (error: any) {
    console.error("❌ Error checking pgvector:", error.message);

    if (
      error.message.includes("relation") &&
      error.message.includes("does not exist")
    ) {
      console.log("\n📝 Tip: Run migrations first: npx prisma migrate dev");
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkPgvector();
