"use client";

import { Job } from "@prisma/client";
import JobCard from "./JobCard";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface AvailableJobsListProps {
  jobs: (Job & { isSaved: boolean })[];
  companySlug: string;
}

const ITEMS_PER_PAGE = 9;

const AvailableJobsList = ({ jobs, companySlug }: AvailableJobsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!jobs || jobs.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 p-12 text-center h-[50vh]">
        <Briefcase className="h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-xl font-semibold text-slate-700">
          No Position Found
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          There are currently no available jobs. Please check back later.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentJobs = jobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-4">
          {currentJobs.map((job) => (
            <JobCard
              companySlug={companySlug}
              key={job.id}
              job={job}
              isSaved={job.isSaved}
            />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-100 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm font-medium text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AvailableJobsList;
