"use client";

import { updateApplicationStatus } from "@/app/actions/updateApplicationStatus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationStatus } from "@/lib/generated/prisma/enums";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UpdateStatusDialogProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateStatusDialog({
  applicationId,
  currentStatus,
  open,
  onOpenChange,
}: UpdateStatusDialogProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateApplicationStatus(applicationId, status);
      toast.success("Status updated successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogDescription>
            Change the status of this application. This will be visible to the
            candidate.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as ApplicationStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ApplicationStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading || status === currentStatus}
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
