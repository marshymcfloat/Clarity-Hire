import "dotenv/config";
import { prisma } from "@/prisma/prisma";

async function main() {
  const argEmail = process.argv[2];
  const envEmail = process.env.ADMIN_EMAIL;
  const email = (argEmail || envEmail || "").trim().toLowerCase();

  if (!email) {
    throw new Error(
      "Missing admin email. Pass as first arg or set ADMIN_EMAIL env var.",
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }

  if (user.role === "PLATFORM_ADMIN") {
    console.log(`User ${email} is already PLATFORM_ADMIN.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "PLATFORM_ADMIN" },
  });

  await prisma.adminAuditLog.create({
    data: {
      actorUserId: user.id,
      action: "BOOTSTRAP_PLATFORM_ADMIN",
      targetType: "USER",
      targetId: user.id,
      reason: "Initial platform admin bootstrap script.",
      metadata: {
        email: user.email,
        previousRole: user.role,
        nextRole: "PLATFORM_ADMIN",
      },
    },
  });

  console.log(`User ${email} promoted to PLATFORM_ADMIN.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
