import { prisma } from "@/prisma/prisma";
import { hash } from "bcryptjs";

async function main() {
  console.log("Starting seed...");

  const plainPassword = process.env.SEED_USER_PASSWORD || "password123";
  const hashedPassword = await hash(plainPassword, 12);
  const now = new Date();

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@clarityhire.dev" },
    update: {
      name: "Platform Admin",
      hashedPassword,
      emailVerified: now,
      role: "PLATFORM_ADMIN",
    },
    create: {
      email: "admin@clarityhire.dev",
      name: "Platform Admin",
      hashedPassword,
      emailVerified: now,
      role: "PLATFORM_ADMIN",
    },
  });
  console.log(`Seeded platform admin: ${adminUser.email}`);

  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@verifiedco.com" },
    update: {
      name: "Verified Company Owner",
      hashedPassword,
      emailVerified: now,
    },
    create: {
      email: "owner@verifiedco.com",
      name: "Verified Company Owner",
      hashedPassword,
      emailVerified: now,
      role: "USER",
    },
  });

  const recruiterUser = await prisma.user.upsert({
    where: { email: "recruiter@verifiedco.com" },
    update: {
      name: "Verified Recruiter",
      hashedPassword,
      emailVerified: now,
    },
    create: {
      email: "recruiter@verifiedco.com",
      name: "Verified Recruiter",
      hashedPassword,
      emailVerified: now,
      role: "USER",
    },
  });

  await prisma.user.upsert({
    where: { email: "applicant@candidate.dev" },
    update: {
      name: "Test Applicant",
      hashedPassword,
      emailVerified: now,
    },
    create: {
      email: "applicant@candidate.dev",
      name: "Test Applicant",
      hashedPassword,
      emailVerified: now,
      role: "USER",
    },
  });

  const pendingOwnerUser = await prisma.user.upsert({
    where: { email: "owner@pendingco.com" },
    update: {
      name: "Pending Company Owner",
      hashedPassword,
      emailVerified: now,
    },
    create: {
      email: "owner@pendingco.com",
      name: "Pending Company Owner",
      hashedPassword,
      emailVerified: now,
      role: "USER",
    },
  });

  let verifiedCompany = await prisma.company.findUnique({
    where: { slug: "verifiedco-demo" },
  });

  if (!verifiedCompany) {
    verifiedCompany = await prisma.company.create({
      data: {
        name: "VerifiedCo Demo",
        slug: "verifiedco-demo",
        description: "A verified demo company used for recruiter workflows.",
        location: "Remote",
        websiteUrl: "https://verifiedco.example",
        ownerId: ownerUser.id,
        verificationStatus: "VERIFIED",
        verificationRequestedAt: now,
        verifiedAt: now,
        verifiedByUserId: adminUser.id,
        verificationReason: "Seeded as verified for local testing.",
        plan: "pro",
        billingStatus: "ACTIVE",
        activePublishedJobsLimit: 20,
      },
    });
  } else {
    verifiedCompany = await prisma.company.update({
      where: { id: verifiedCompany.id },
      data: {
        verificationStatus: "VERIFIED",
        verificationRequestedAt: now,
        verifiedAt: now,
        verifiedByUserId: adminUser.id,
        verificationReason: "Seeded as verified for local testing.",
        suspendedAt: null,
        suspensionReason: null,
        plan: "pro",
        billingStatus: "ACTIVE",
        activePublishedJobsLimit: 20,
      },
    });
  }
  console.log(`Seeded verified company: ${verifiedCompany.slug}`);

  await prisma.companyMember.upsert({
    where: {
      userId_companyId: {
        userId: ownerUser.id,
        companyId: verifiedCompany.id,
      },
    },
    update: { role: "ADMIN" },
    create: {
      userId: ownerUser.id,
      companyId: verifiedCompany.id,
      role: "ADMIN",
    },
  });

  await prisma.companyMember.upsert({
    where: {
      userId_companyId: {
        userId: recruiterUser.id,
        companyId: verifiedCompany.id,
      },
    },
    update: { role: "RECRUITER" },
    create: {
      userId: recruiterUser.id,
      companyId: verifiedCompany.id,
      role: "RECRUITER",
    },
  });

  const existingPublishedJob = await prisma.job.findFirst({
    where: {
      companyId: verifiedCompany.id,
      title: "Senior Full Stack Engineer",
    },
    select: { id: true },
  });

  if (!existingPublishedJob) {
    await prisma.job.create({
      data: {
        title: "Senior Full Stack Engineer",
        companyId: verifiedCompany.id,
        department: "Engineering",
        experienceLevel: "SENIOR",
        jobType: "FULL_TIME",
        location: "Remote",
        workArrangement: "REMOTE",
        status: "PUBLISHED",
        summary:
          "Build and scale modern web applications with Next.js, Node.js, and PostgreSQL.",
        responsibilities: [
          "Build new platform features.",
          "Design reliable backend services.",
          "Review and mentor across the team.",
        ],
        qualifications: [
          "5+ years in software engineering.",
          "Strong TypeScript and React experience.",
          "Production SQL and API design experience.",
        ],
        skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"],
        salaryMin: 120000,
        salaryMax: 180000,
      },
    });
  }

  let pendingCompany = await prisma.company.findUnique({
    where: { slug: "pendingco-demo" },
  });

  if (!pendingCompany) {
    pendingCompany = await prisma.company.create({
      data: {
        name: "PendingCo Demo",
        slug: "pendingco-demo",
        description: "A pending company waiting for verification review.",
        location: "Remote",
        websiteUrl: "https://pendingco.example",
        ownerId: pendingOwnerUser.id,
        verificationStatus: "PENDING",
        verificationRequestedAt: now,
        verificationReason: "Seeded pending verification.",
        plan: "free",
        billingStatus: "NONE",
        activePublishedJobsLimit: 1,
      },
    });
  } else {
    pendingCompany = await prisma.company.update({
      where: { id: pendingCompany.id },
      data: {
        verificationStatus: "PENDING",
        verificationRequestedAt: now,
        verifiedAt: null,
        verifiedByUserId: null,
        suspendedAt: null,
        suspensionReason: null,
        verificationReason: "Seeded pending verification.",
        plan: "free",
        billingStatus: "NONE",
        activePublishedJobsLimit: 1,
      },
    });
  }
  console.log(`Seeded pending company: ${pendingCompany.slug}`);

  await prisma.companyMember.upsert({
    where: {
      userId_companyId: {
        userId: pendingOwnerUser.id,
        companyId: pendingCompany.id,
      },
    },
    update: { role: "ADMIN" },
    create: {
      userId: pendingOwnerUser.id,
      companyId: pendingCompany.id,
      role: "ADMIN",
    },
  });

  const existingPendingJob = await prisma.job.findFirst({
    where: {
      companyId: pendingCompany.id,
      title: "Product Designer",
    },
    select: { id: true },
  });

  if (!existingPendingJob) {
    await prisma.job.create({
      data: {
        title: "Product Designer",
        companyId: pendingCompany.id,
        department: "Design",
        experienceLevel: "MID_LEVEL",
        jobType: "FULL_TIME",
        location: "Remote",
        workArrangement: "REMOTE",
        status: "PENDING_REVIEW",
        summary: "Design intuitive user journeys and high quality UI patterns.",
        responsibilities: [
          "Lead design discovery and wireframing.",
          "Collaborate with product and engineering.",
        ],
        qualifications: [
          "3+ years product design experience.",
          "Strong UX and visual design portfolio.",
        ],
        skills: ["Figma", "UX Research", "Interaction Design"],
      },
    });
  }

  console.log("");
  console.log("Seed completed successfully.");
  console.log("Users (password):");
  console.log(`- admin@clarityhire.dev (${plainPassword}) [PLATFORM_ADMIN]`);
  console.log(`- owner@verifiedco.com (${plainPassword}) [Company Owner]`);
  console.log(`- recruiter@verifiedco.com (${plainPassword}) [Recruiter]`);
  console.log(`- owner@pendingco.com (${plainPassword}) [Pending Company Owner]`);
  console.log(`- applicant@candidate.dev (${plainPassword}) [Applicant]`);
  console.log("");
  console.log("Demo companies:");
  console.log("- verifiedco-demo (VERIFIED, pro, ACTIVE, limit 20)");
  console.log("- pendingco-demo (PENDING, free, NONE, limit 1)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
