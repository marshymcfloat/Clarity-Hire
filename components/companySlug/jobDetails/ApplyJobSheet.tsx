import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import React from "react";
import JobApplicationDataContainer from "./JobApplicationDataContainer";
import { Sparkles, ArrowRight } from "lucide-react";

const ApplyJobSheet = ({
  jobTitle,
  jobSummary,
  jobId,
}: {
  jobTitle: string;
  jobSummary: string;
  jobId: string;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="relative group overflow-hidden bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
          <span className="relative flex items-center gap-2">
            Apply Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl p-0 overflow-y-auto bg-white/95 backdrop-blur-xl border-l border-slate-100">
        <SheetHeader className="p-6 pb-2 border-b border-slate-100 bg-white/50 sticky top-0 z-10 backdrop-blur-md supports-[backdrop-filter]:bg-white/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Application
            </span>
          </div>
          <SheetTitle className="font-space text-2xl font-bold text-slate-900 text-left">
            {jobTitle}
          </SheetTitle>
          <SheetDescription className="text-slate-500 text-left line-clamp-2">
            {jobSummary}
          </SheetDescription>
        </SheetHeader>
        <div className="p-6">
          <JobApplicationDataContainer jobId={jobId} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ApplyJobSheet;
