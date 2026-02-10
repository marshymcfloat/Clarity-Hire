import { prisma } from "@/prisma/prisma";
import React from "react";
import ApplicantDataTable from "./ApplicantDataTable";
import { applicantColumns, Applicant } from "./ApplicantColumns";
import { JOB_MANAGEMENT_ROLES } from "@/lib/security";
import { requireRecruiterAccess } from "@/lib/server-auth";

const ApplicantInitialDataContainer = async () => {
  const auth = await requireRecruiterAccess({
    allowedMemberRoles: JOB_MANAGEMENT_ROLES,
  });

  if (!auth.authorized) return null;

  const applications = (await prisma.application.findMany({
    where: {
      Job: { companyId: auth.access.companyId },
    },
    include: {
      Job: { select: { title: true, id: true } },
      User: { select: { id: true, name: true, email: true, image: true } },
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
