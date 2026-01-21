"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import CreateJobForm from "./CreateJobForm";
import { useRef, useState } from "react";
import { Job, QuestionOnJob } from "@prisma/client";

const EditJobDialog = ({
  job,
}: {
  job: Job & { QuestionOnJob: QuestionOnJob[] };
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);

  function handleSuccess() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogClose className="hidden" ref={closeButtonRef} />

      <DialogTrigger asChild>
        <div className="flex gap-2 items-center cursor-pointer w-full">
          <Edit className="h-4 w-4" />
          <p>Edit</p>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Posting</DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>
        <CreateJobForm onSuccess={handleSuccess} initialData={job} />
      </DialogContent>
    </Dialog>
  );
};

export default EditJobDialog;
