import { Job } from "@prisma/client";
import JobCard from "./JobCard";
import { Briefcase } from "lucide-react";

interface AvailableJobsListProps {
  jobs: (Job & { isSaved: boolean })[];
  companySlug: string;
}

const AvailableJobsList = ({ jobs, companySlug }: AvailableJobsListProps) => {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 p-12 text-center">
        <Briefcase className="h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-xl font-semibold text-slate-700">
          No Open Positions
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          There are currently no available jobs. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard companySlug={companySlug} key={job.id} job={job} />
      ))}
    </div>
  );
};

export default AvailableJobsList;
