"use server";

import { prisma } from "@/prisma/prisma";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JOB_MANAGEMENT_ROLES } from "@/lib/security";
import { requireRecruiterAccess } from "@/lib/server-auth";

export async function toggleSaveJob(jobId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { saved: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  const existingSave = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  if (existingSave) {
    await prisma.savedJob.delete({
      where: {
        id: existingSave.id,
      },
    });
    revalidatePath(
      "/(authenticated routes)/(applicant)/[companySlug]/available-jobs",
    );
    return { saved: false };
  } else {
    await prisma.savedJob.create({
      data: {
        userId,
        jobId,
      },
    });
    revalidatePath(
      "/(authenticated routes)/(applicant)/[companySlug]/available-jobs",
    );
    return { saved: true };
  }
}

export async function getCompanyJobsAction() {
  const auth = await requireRecruiterAccess({
    allowedMemberRoles: JOB_MANAGEMENT_ROLES,
  });

  if (!auth.authorized) return [];

  const jobs = await prisma.job.findMany({
    where: { companyId: auth.access.companyId, status: "PUBLISHED" },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return jobs;
}
