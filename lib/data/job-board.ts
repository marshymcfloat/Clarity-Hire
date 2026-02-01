import { prisma } from "@/prisma/prisma";
import { unstable_cache } from "next/cache";
import { JobCardData } from "@/types";

export const getAvailableJobs = unstable_cache(
  async (companySlug: string, userId?: string) => {
    const company = await prisma.company.findFirst({
      where: { slug: companySlug },
      select: { id: true },
    });

    const availableJobs = await prisma.job.findMany({
      where: {
        companyId: company?.id,
        status: "PUBLISHED",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        summary: true,
        experienceLevel: true,
        jobType: true,
        location: true,
        createdAt: true,
        SavedJob: {
          where: { userId: userId ?? "NO_USER" },
          select: { id: true },
        },
      },
    });

    return availableJobs.map(
      (job: JobCardData & { SavedJob: { id: string }[] }) => ({
        ...job,
        isSaved: job.SavedJob.length > 0,
      }),
    );
  },
  ["available-jobs"],
  {
    revalidate: 600,
    tags: ["available-jobs"],
  },
);
