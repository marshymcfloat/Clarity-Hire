"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import CreateJobForm from "./CreateJobForm";
import { useState, useMemo } from "react";
import { Job, QuestionOnJob } from "@prisma/client";
import { CreateJobValues } from "@/lib/zod schemas/jobSchema";

type JobWithQuestions = Job & {
  QuestionOnJob?: QuestionOnJob[];
};

const EditJobDialog = ({ job }: { job: JobWithQuestions }) => {
  const [open, setOpen] = useState(false);

  // Transform Job data to CreateJobValues format - memoized to prevent unnecessary recalculations
  const initialData = useMemo((): CreateJobValues & { id: string } => ({
    id: job.id,
    title: job.title,
    summary: job.summary,
    department: job.department,
    location: job.location,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    workArrangement: job.workArrangement,
    status: job.status,
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    benefits: job.benefits ?? [],
    qualifications: job.qualifications ?? [],
    responsibilities: job.responsibilities ?? [],
    skills: job.skills ?? [],
    workSchedule: job.workSchedule ?? "",
    questions: job.QuestionOnJob?.map((q) => ({
      questionId: q.questionId,
      required: q.isRequired,
    })) ?? [],
  }), [job]);

  function handleSuccess() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="flex gap-2 items-center">
          <Edit />
          <p>Edit</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Posting</DialogTitle>
          <DialogDescription>
            Update the details below. You can use our AI assistant to help
            generate content.
          </DialogDescription>
        </DialogHeader>
        {open && <CreateJobForm onSuccess={handleSuccess} initialData={initialData} />}
      </DialogContent>
    </Dialog>
  );
};

export default EditJobDialog;
