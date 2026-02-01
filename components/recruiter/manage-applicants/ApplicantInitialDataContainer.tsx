import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { getServerSession } from "next-auth";
import React from "react";
import ApplicantDataTable from "./ApplicantDataTable";
import { applicantColumns, Applicant } from "./ApplicantColumns";

const ApplicantInitialDataContainer = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.activeCompanyId) return null;

  const applications = (await prisma.application.findMany({
    where: {
      Job: { companyId: session.user.activeCompanyId },
    },
    include: {
      Job: { select: { title: true, id: true } },
      User: { select: { name: true, email: true, image: true } },
      Resume: { select: { url: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })) as unknown as Applicant[];

  return (
    <div className="h-full flex-1 flex-col">
      <ApplicantDataTable data={applications} columns={applicantColumns} />
    </div>
  );
};

export default ApplicantInitialDataContainer;
