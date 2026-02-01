"use client";

import { JobCardData } from "@/types";
import JobCard from "./JobCard";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Button } from "../ui/button";

interface AvailableJobsListProps {
  jobs: (JobCardData & { isSaved: boolean })[];
  companySlug: string;
}

const ITEMS_PER_PAGE = 9;

const AvailableJobsList = ({ jobs, companySlug }: AvailableJobsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((jobs?.length || 0) / ITEMS_PER_PAGE);

  const currentJobs = useMemo(() => {
    if (!jobs) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return jobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [jobs, currentPage]);

  const handlePrevious = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  if (!jobs || jobs.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center h-[400px]">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Briefcase className="h-8 w-8 text-indigo-500" />
        </div>
        <h3 className="font-space font-bold text-xl text-slate-900 mb-2">
          No Positions Found
        </h3>
        <p className="max-w-[300px] text-slate-500 text-sm leading-relaxed">
          There are currently no available jobs at{" "}
          <span className="font-semibold text-slate-700">{companySlug}</span>.
          Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-8">
      <div className="flex-1">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="flex items-center justify-center gap-4 py-8 border-t border-slate-100 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="font-mono text-xs"
          >
            <ChevronLeft className="h-3 w-3 mr-1" /> Prev
          </Button>
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="font-mono text-xs"
          >
            Next <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AvailableJobsList;
