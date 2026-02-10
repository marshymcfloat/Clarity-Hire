"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { ApplicationStatus } from "@/lib/generated/prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { getRecruiterContext, JOB_MANAGEMENT_ROLES } from "@/lib/security";

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      Job: {
        select: {
          companyId: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const access = await getRecruiterContext(session.user.id, {
    companyId: application.Job.companyId,
    allowedMemberRoles: JOB_MANAGEMENT_ROLES,
  });

  if (!access.authorized) {
    throw new Error(access.error);
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus },
  });

  if (access.companySlug && session.user.memberId) {
    revalidatePath(
      `/${access.companySlug}/${session.user.memberId}/manage-applicants`,
      "page",
    );
  } else {
    revalidatePath("/", "layout");
  }
}
