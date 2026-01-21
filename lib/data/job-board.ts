import { prisma } from "@/prisma/prisma";
import { unstable_cache } from "next/cache";
import { Job } from "@prisma/client";

export const getAvailableJobs = unstable_cache(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (companySlug: string, userId?: string) => {
    const company = await prisma.company.findFirst({
      where: { slug: companySlug },
      select: { id: true },
    });

    const availableJobs = await prisma.job.findMany({
      where: { companyId: company?.id },
      include: {
        SavedJob: {
          where: { userId: userId ?? "NO_USER" },
          select: { id: true },
        },
      },
    });

    return availableJobs.map((job: Job & { SavedJob: { id: string }[] }) => ({
      ...job,
      isSaved: job.SavedJob.length > 0,
    }));
  },
  ["available-jobs"],
  {
    revalidate: 600,
    tags: ["available-jobs"],
  },
);
