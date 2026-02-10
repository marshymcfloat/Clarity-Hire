"use client";

import { useTransition } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitJobForReviewAction } from "@/lib/actions/createJobActions";

type Props = {
  jobId: string;
};

export default function SubmitForReviewButton({ jobId }: Props) {
  const [isPending, startTransition] = useTransition();
  const { companySlug, memberId } = useParams();

  const onSubmit = () => {
    if (
      !companySlug ||
      typeof companySlug !== "string" ||
      !memberId ||
      typeof memberId !== "string"
    ) {
      toast.error("Missing route params for submitting review.");
      return;
    }

    startTransition(async () => {
      const result = await submitJobForReviewAction({
        id: jobId,
        companySlug,
        memberId,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to submit job for review.");
        return;
      }

      toast.success(result.message || "Job submitted for review.");
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={onSubmit}
    >
      {isPending ? "Submitting..." : "Submit For Review"}
    </Button>
  );
}
