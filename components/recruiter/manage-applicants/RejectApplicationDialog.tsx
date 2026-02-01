"use client";

import { updateApplicationStatus } from "@/app/actions/updateApplicationStatus";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApplicationStatus } from "@/lib/generated/prisma/enums";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RejectApplicationDialogProps {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RejectApplicationDialog({
  applicationId,
  open,
  onOpenChange,
}: RejectApplicationDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      await updateApplicationStatus(applicationId, ApplicationStatus.REJECTED);
      toast.success("Application rejected");
      onOpenChange(false);
    } catch {
      toast.error("Failed to reject application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Application?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject this candidate? This action will
            update their status to <strong>Rejected</strong>. You can undo this
            later by updating the status manually.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleReject();
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Reject Candidate"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
