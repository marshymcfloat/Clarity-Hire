import CreateJobDialog from "@/components/recruiter/manage jobs/CreateJobDialog";
import CreateQuestionDialog from "@/components/recruiter/manage jobs/CreateQuestionDialog";
import ManageJobsInitialDataContainer from "@/components/recruiter/manage jobs/ManageJobsInitialDataContainer";
import ManageJobsSkeleton from "@/components/recruiter/manage jobs/ManageJobsSkeleton";
import React, { Suspense } from "react";

const ManageJobsPage = () => {
  return (
    <section className="h-full p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-space text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Jobs
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and track your job postings.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
