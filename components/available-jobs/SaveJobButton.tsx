"use client";

import { useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { toggleSaveJob } from "@/app/actions/job";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobId: string;
  initialIsSaved: boolean;
}

const SaveJobButton = ({ jobId, initialIsSaved }: SaveJobButtonProps) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = !isSaved;
    setIsSaved(newState);

    startTransition(async () => {
      try {
        const result = await toggleSaveJob(jobId);
        if (result.error === "Unauthorized") {
          setIsSaved(!newState);
          toast.error("Please login to save jobs");
          window.location.href = "/api/auth/signin";
          return;
        }

        if (result.saved !== newState) {
          setIsSaved(result.saved);
        }
        toast.success(result.saved ? "Job saved" : "Job removed from saved");
      } catch {
        setIsSaved(!newState);
        toast.error("Failed to save job");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="ml-auto"
      onClick={handleToggleSave}
      disabled={isPending}
    >
      <Bookmark
        className={cn(
          "h-5 w-5",
          isSaved ? "fill-current text-primary" : "text-muted-foreground",
        )}
      />
      <span className="sr-only">{isSaved ? "Unsave job" : "Save job"}</span>
    </Button>
  );
};

export default SaveJobButton;
