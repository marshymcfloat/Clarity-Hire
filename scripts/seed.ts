import { prisma } from "@/prisma/prisma";
import { hash } from "bcryptjs";

async function main() {
  console.log("🌱 Starting seed...");

  const email = "recruiter@example.com";
  const password = await hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Test Recruiter",
      hashedPassword: password,
      emailVerified: new Date(),
    },
  });

  console.log(`👤 Created user: ${user.email}`);

  // 2. Create a company
  const companySlug = "clarity-hire-demo";
  const company = await prisma.company.upsert({
    where: { slug: companySlug },
    update: {},
    create: {
      name: "Clarity Hire Demo",
      slug: companySlug,
      description: "A demo company for testing RAG implementation.",
      location: "Remote",
      ownerId: user.id, // User is the owner
      websiteUrl: "https://clarityhire.ai",
    },
  });

  console.log(`🏢 Created company: ${company.name}`);

  // 3. Create a Job Opening
  const job = await prisma.job.create({
    data: {
      title: "Senior Full Stack Engineer",
      companyId: company.id,
      department: "Engineering",
      experienceLevel: "SENIOR",
      jobType: "FULL_TIME",
      location: "Remote",
      workArrangement: "REMOTE",
      status: "PUBLISHED",
      summary: `We are looking for a Senior Full Stack Engineer to join our team. 
      You will be working with React, Next.js, Node.js, and PostgreSQL.
      Experience with AI/LLMs is a plus.`,
      responsibilities: [
        "Develop new features using Next.js and React",
        "Design and optimize database schemas",
        "Mentor junior developers",
      ],
      qualifications: [
        "5+ years of experience with JavaScript/TypeScript",
        "Strong knowledge of React and Node.js",
        "Experience with SQL databases",
      ],
      skills: ["React", "Next.js", "TypeScript", "PostgreSQL", "TailwindCSS"],
      salaryMin: 120000,
      salaryMax: 180000,
    },
  });

  console.log(`💼 Created job: ${job.title} (ID: ${job.id})`);

  // 4. Create a Recruiter User
  const recruiterEmail = "recruiter@example.com";
  // We can reuse the same hashed password for simplicity
  const recruiterUser = await prisma.user.upsert({
    where: { email: recruiterEmail },
    update: {},
    create: {
      email: recruiterEmail,
      name: "Jane Recruiter",
      hashedPassword: password,
      emailVerified: new Date(),
    },
  });

  console.log(`👤 Created recruiter: ${recruiterUser.email}`);

  // 5. Add Recruiter to Company
  await prisma.companyMember.upsert({
    where: {
      userId_companyId: {
        userId: recruiterUser.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: recruiterUser.id,
      companyId: company.id,
      role: "RECRUITER",
    },
  });

  console.log(`🤝 Added recruiter to company: ${company.name} as RECRUITER`);
  console.log("\n✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
