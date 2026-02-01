import React, { Suspense } from "react";
import ManageApplicantsSkeleton from "@/components/recruiter/manage-applicants/ManageApplicantsSkeleton";
import ApplicantInitialDataContainer from "@/components/recruiter/manage-applicants/ApplicantInitialDataContainer";

const ManageApplicantsPage = () => {
  return (
    <section className="h-full p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold font-space text-slate-900 dark:text-slate-100 tracking-tight">
          Manage Applicants
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage candidates across all your jobs.
        </p>
      </div>

      <Suspense fallback={<ManageApplicantsSkeleton />}>
        <ApplicantInitialDataContainer />
      </Suspense>
    </section>
  );
};

export default ManageApplicantsPage;
