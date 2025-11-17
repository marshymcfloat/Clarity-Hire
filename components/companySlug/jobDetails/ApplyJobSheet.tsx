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
        <Button className="lg:min-w-[150px]">Apply</Button>
      </SheetTrigger>
      <SheetContent className="p-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{jobTitle}</SheetTitle>
          <SheetDescription>{jobSummary}</SheetDescription>
        </SheetHeader>
        <JobApplicationDataContainer jobId={jobId} />
      </SheetContent>
    </Sheet>
  );
};

export default ApplyJobSheet;
