import React, { Suspense } from "react";
import Loading from "./loading";
import ApplicantInitialDataContainer from "@/components/recruiter/manage-applicants/ApplicantInitialDataContainer";

const ManageApplicantsPage = () => {
  return (
    <section className="h-full">
      <Suspense fallback={<Loading />}>
        <ApplicantInitialDataContainer />
      </Suspense>
    </section>
  );
};

export default ManageApplicantsPage;
