import React from "react";

import { MapPin, TrendingUp, Clock, ArrowRight, Briefcase } from "lucide-react";
import { EXPERIENCE_LEVEL_MAP, JOB_TYPE_MAP } from "@/constants";
import { formatPostedDate } from "@/lib/utils";
import ProgressLink from "../ui/ProgressLink";
import SaveJobButton from "./SaveJobButton";
import { JobCardData } from "@/types";

interface JobCardProps {
  job: JobCardData;
  companySlug: string;
  isSaved?: boolean;
}

const JobCard = React.memo(
  ({ job, companySlug, isSaved = false }: JobCardProps) => {
    return (
      <ProgressLink
        href={`/${companySlug}/available-jobs/${job.id}`}
        className="group relative flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

        <div className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3 gap-3">
            <h3 className="font-space font-bold text-lg text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2">
              {job.title}
            </h3>
            <div className="shrink-0 -mr-1 -mt-1">
              <SaveJobButton jobId={job.id} initialIsSaved={isSaved} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium uppercase tracking-wide border border-slate-100">
              <MapPin className="w-3 h-3 text-slate-400" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium uppercase tracking-wide border border-slate-100">
              <TrendingUp className="w-3 h-3 text-slate-400" />
              {
                EXPERIENCE_LEVEL_MAP[
                  job.experienceLevel as keyof typeof EXPERIENCE_LEVEL_MAP
                ]
              }
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium uppercase tracking-wide border border-slate-100">
              <Briefcase className="w-3 h-3 text-slate-400" />
              {JOB_TYPE_MAP[job.jobType as keyof typeof JOB_TYPE_MAP]}
            </span>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6 flex-grow">
            {job.summary}
          </p>

          <div className="pt-4 mt-auto border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Posted {formatPostedDate(job.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
              View Role <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </ProgressLink>
    );
  },
);

JobCard.displayName = "JobCard";

export default JobCard;
