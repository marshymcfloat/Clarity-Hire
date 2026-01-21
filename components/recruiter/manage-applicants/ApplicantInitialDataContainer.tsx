import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { getServerSession } from "next-auth";
import React from "react";
import ApplicantDataTable from "./ApplicantDataTable";
import { applicantColumns } from "./ApplicantColumns";

const ApplicantInitialDataContainer = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.activeCompanyId) return null;

  const applications = await prisma.application.findMany({
    where: {
      Job: { companyId: session.user.activeCompanyId },
    },
    include: {
      Job: { select: { title: true, id: true } },
      User: { select: { name: true, email: true, image: true } },
      Resume: { select: { url: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Applicants
          </h2>
          <p className="text-muted-foreground">
            View and manage candidates across all your jobs.
          </p>
        </div>
      </div>
      <ApplicantDataTable data={applications} columns={applicantColumns} />
    </div>
  );
};

export default ApplicantInitialDataContainer;
