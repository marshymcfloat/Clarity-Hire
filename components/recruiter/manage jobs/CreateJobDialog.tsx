"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateJobForm from "./CreateJobForm";
import { PlusCircle } from "lucide-react";

const CreateJobDialog = () => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Job Posting</DialogTitle>
          <DialogDescription>
            Fill in the details below. You can use our AI assistant to help
            generate content.
          </DialogDescription>
        </DialogHeader>
        <CreateJobForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
