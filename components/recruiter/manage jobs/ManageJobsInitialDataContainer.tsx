import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { getServerSession } from "next-auth";
import React from "react";
import JobDataTable from "./JobDataTable";
import { jobColumns } from "./JobsColumn";

const ManageJobsInitialDataContainer = async () => {
  const session = await getServerSession(authOptions);
  const jobs = await prisma.job.findMany({
    where: { companyId: session?.user.activeCompanyId },
    include: { QuestionOnJob: true },
  });

  return <JobDataTable columns={jobColumns} data={jobs} />;
};

export default ManageJobsInitialDataContainer;
