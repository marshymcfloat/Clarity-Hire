import "dotenv/config";
import { resumeQueue } from "../lib/queue/queues";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🔄 Triggering RAG pipeline manually...");

  const resume = await prisma.resume.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!resume) {
    console.error("❌ No resume found in database.");
    return;
  }

  console.log(`📄 Found resume: ${resume.id} (${resume.name})`);
  console.log(`🔗 URL: ${resume.url}`);

  await resumeQueue.add("parse", {
    resumeId: resume.id,
    resumeUrl: resume.url,
    fileType: resume.fileType,
  });

  console.log("✅ Job added to 'parse' queue.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit(0);
  });
