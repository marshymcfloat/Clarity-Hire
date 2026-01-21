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
