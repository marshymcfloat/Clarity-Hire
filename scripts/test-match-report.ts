/* import { prisma } from "../lib/prisma";
import { generateMatchReport } from "../lib/rag/match-report";

async function testMatchReport() {
  console.log("🧪 Testing Match Report Generation");

  try {
    // 1. Get a candidate and a job
    const candidate = await prisma.user.findFirst({
      where: {
        Resume: {
          some: {
            ParsedDocument: {
              isNot: null,
            },
          },
        },
      },
    });

    // Create a dummy job if needed, or find one
    let job = await prisma.job.findFirst({
      include: { Company: true },
    });

    if (!job) {
      // Create a dummy job for testing if none exists
      console.log("⚠️ No job found. Creating a test job...");
      const company = await prisma.company.findFirst();
      if (!company) throw new Error("No company found to create a job under.");

      job = await prisma.job.create({
        data: {
          title: "Senior Full Stack Engineer",
          companyId: company.id,
          department: "Engineering",
          experienceLevel: "SENIOR",
          jobType: "FULL_TIME",
          location: "Remote",
          summary:
            "We are looking for a Senior Full Stack Engineer to join our team. You will be responsible for building scalable web applications using Next.js and Node.js.",
          responsibilities: [
            "Develop new features",
            "Mentor junior engineers",
            "Optimize performance",
          ],
          qualifications: [
            "5+ years experience",
            "Strong TypeScript skills",
            "Experience with AWS",
          ],
          skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
          status: "PUBLISHED",
        },
        include: { Company: true },
      });
    }

    if (!candidate) throw new Error("No candidate with a parsed resume found.");

    console.log(`👤 Using Candidate: ${candidate.email} (${candidate.id})`);
    console.log(
      `💼 Using Job: ${job.title} at ${job.Company.name} (${job.id})`,
    );

    // 2. Generate Report
    console.log("🤖 Generating Match Report... (this may take a few seconds)");
    const report = await generateMatchReport(candidate.id, job.id);

    console.log("\n✅ Match Report Generated Successfully!");
    console.log("--------------------------------------------------");
    console.log(`🎯 Match Score: ${report.matchScore}/100`);
    console.log(`📝 Summary: ${report.fitSummary}`);
    console.log("\n👍 Pros:");
    report.pros.forEach((p) => console.log(`  - ${p}`));
    console.log("\n👎 Cons:");
    report.cons.forEach((c) => console.log(`  - ${c}`));
    console.log("\n❓ Interview Questions:");
    // @ts-ignore - interviewKit is Json, but we know the structure
    report.interviewKit?.questions?.forEach((q) => console.log(`  - ${q}`));
    console.log("--------------------------------------------------");

    // 3. Verify Database Persistence
    const savedMatch = await prisma.candidateJobMatch.findUnique({
      where: { id: report.id },
    });

    if (savedMatch) {
      console.log("💾 Verified: Match record saved to database.");
    } else {
      console.error("❌ Error: Match record not found in database.");
    }
  } catch (error) {
    console.error("❌ Test Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testMatchReport();
 */
