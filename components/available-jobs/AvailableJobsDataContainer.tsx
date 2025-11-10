import { prisma } from "@/prisma/prisma";
import AvailableJobsList from "./AvailableJobsList";
import { cache } from "react";

export const revalidate = 600;

const getAvailableJobs = cache(async (companySlug: string) => {
  const company = await prisma.company.findFirst({
    where: { slug: companySlug },
    select: { id: true },
  });

  const availableJobs = await prisma.job.findMany({
    where: { companyId: company?.id },
  });

  return availableJobs;
});

const AvailableJobsDataContainer = async ({
  companySlug,
}: {
  companySlug: string;
}) => {
  const availableJobs = await getAvailableJobs(companySlug);

  return <AvailableJobsList jobs={availableJobs} companySlug={companySlug} />;
};

export default AvailableJobsDataContainer;
