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
import CreateQuestionForm from "./CreateQuestionForm";
import { PlusCircle } from "lucide-react";

const CreateQuestionDialog = () => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Question</DialogTitle>
          <DialogDescription>
            This question will be saved to your library and can be added to any
            job posting.
          </DialogDescription>
        </DialogHeader>
        <CreateQuestionForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuestionDialog;
