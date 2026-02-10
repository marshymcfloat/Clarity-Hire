import { prisma } from "@/prisma/prisma";
import React from "react";
import JobDataTable from "./JobDataTable";
import { jobColumns } from "./JobsColumn";
import DashboardHeader from "./DashboardHeader";
import { Prisma } from "@/lib/generated/prisma/client";
import { JOB_MANAGEMENT_ROLES } from "@/lib/security";
import { requireRecruiterAccess } from "@/lib/server-auth";

const ManageJobsInitialDataContainer = async () => {
  const auth = await requireRecruiterAccess({
    allowedMemberRoles: JOB_MANAGEMENT_ROLES,
  });

  if (!auth.authorized) return null;

  const jobsWithCounts = (await prisma.job.findMany({
    where: { companyId: auth.access.companyId },
    include: {
      QuestionOnJob: true,
      _count: {
        select: { Application: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as unknown as Prisma.JobGetPayload<{
    include: {
      QuestionOnJob: true;
      _count: {
        select: { Application: true };
      };
    };
  }>[];

  const totalJobs = jobsWithCounts.length;
  const activeCandidates = jobsWithCounts.reduce((acc, job) => {
    return acc + (job._count?.Application ?? 0);
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader stats={{ totalJobs, activeCandidates, totalViews: 0 }} />
      <JobDataTable columns={jobColumns} data={jobsWithCounts} />
    </div>
  );
};

export default ManageJobsInitialDataContainer;
