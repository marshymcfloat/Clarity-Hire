"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { ApplicationStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.activeCompanyId) {
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

  if (application.Job.companyId !== session.user.activeCompanyId) {
    throw new Error("Unauthorized: Application belongs to another company");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus },
  });

  revalidatePath(
    "/(recruiter)/[companySlug]/[memberId]/manage-applicants",
    "page",
  );
}
