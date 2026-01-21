import JobApplicationsInitialDataContainer from "@/components/applicant/job-applications/JobApplicationsInitialDataContainer";
import JobApplicationsSkeleton from "@/components/applicant/job-applications/JobApplicationsSkeleton";
import { Suspense } from "react";

const JobApplicationsPage = () => {
  return (
    <Suspense fallback={<JobApplicationsSkeleton />}>
      <JobApplicationsInitialDataContainer />
    </Suspense>
  );
};

export default JobApplicationsPage;
