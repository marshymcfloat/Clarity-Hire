import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { getServerSession } from "next-auth";
import React from "react";
import JobDataTable from "./JobDataTable";
import { jobColumns } from "./JobsColumn";
import DashboardHeader from "./DashboardHeader";

const ManageJobsInitialDataContainer = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.activeCompanyId) return null;

  const jobsWithCounts = await prisma.job.findMany({
    where: { companyId: session.user.activeCompanyId },
    include: {
      QuestionOnJob: true,
      _count: {
        select: { Application: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalJobs = jobsWithCounts.length;
  const activeCandidates = jobsWithCounts.reduce(
    (acc: number, job: (typeof jobsWithCounts)[number]) =>
      acc + (job._count?.Application || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader stats={{ totalJobs, activeCandidates, totalViews: 0 }} />
      <JobDataTable columns={jobColumns} data={jobsWithCounts} />
    </div>
  );
};

export default ManageJobsInitialDataContainer;
