import React, { Suspense } from "react";
import ManageApplicantsSkeleton from "@/components/recruiter/manage-applicants/ManageApplicantsSkeleton";
import ApplicantInitialDataContainer from "@/components/recruiter/manage-applicants/ApplicantInitialDataContainer";

const ManageApplicantsPage = () => {
  return (
    <section className="h-full">
      <Suspense fallback={<ManageApplicantsSkeleton />}>
        <ApplicantInitialDataContainer />
      </Suspense>
    </section>
  );
};

export default ManageApplicantsPage;
