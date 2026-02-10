"use server";

import { prisma } from "@/prisma/prisma";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const { prisma } = await import("@/lib/prisma"); // Dynamic import to avoid circular dep issues if any, or just consistent

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      Company: { select: { id: true } },
      CompanyMember: { select: { companyId: true, role: true } },
    },
  });

  const companyId = user?.Company?.id || user?.CompanyMember?.[0]?.companyId;
  if (!companyId) return [];

  const jobs = await prisma.job.findMany({
    where: { companyId, status: "PUBLISHED" },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return jobs;
}
