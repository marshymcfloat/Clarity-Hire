import CreateJobDialog from "@/components/recruiter/manage jobs/CreateJobDialog";
import CreateQuestionDialog from "@/components/recruiter/manage jobs/CreateQuestionDialog";
import ManageJobsInitialDataContainer from "@/components/recruiter/manage jobs/ManageJobsInitialDataContainer";
import ManageJobsSkeleton from "@/components/recruiter/manage jobs/ManageJobsSkeleton";
import React, { Suspense } from "react";

const ManageJobsPage = () => {
  return (
    <section className="flex flex-col  h-full gap-4">
      <div className="flex  justify-end">
        <div className="flex gap-4">
          <CreateQuestionDialog />
          <CreateJobDialog />
        </div>
      </div>

      <Suspense fallback={<ManageJobsSkeleton />}>
        <ManageJobsInitialDataContainer />
      </Suspense>
    </section>
  );
};

export default ManageJobsPage;
