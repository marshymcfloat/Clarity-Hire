"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  approveJobAction,
  rejectJobAction,
} from "@/lib/actions/admin/jobAdminActions";

type JobRow = {
  id: string;
  title: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
  createdAt: Date;
  company: {
    id: string;
    name: string;
    slug: string;
    verificationStatus:
      | "UNVERIFIED"
      | "PENDING"
      | "VERIFIED"
      | "REJECTED"
      | "SUSPENDED";
  };
};

export default function JobAdminTable({ jobs }: { jobs: JobRow[] }) {
  const [isPending, startTransition] = useTransition();

  const runAction = (
    action: (jobId: string, reason?: string) => Promise<{
      success: boolean;
      error?: string;
      message?: string;
    }>,
    jobId: string,
    promptMessage: string,
  ) => {
    const reason = window.prompt(promptMessage);
    if (reason === null) {
      return;
    }

    startTransition(async () => {
      const result = await action(jobId, reason || undefined);
      if (!result.success) {
        toast.error(result.error || "Action failed.");
        return;
      }
      toast.success(result.message || "Action completed.");
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">Job</th>
            <th className="px-4 py-3 font-semibold">Company</th>
            <th className="px-4 py-3 font-semibold">Company Status</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-t">
              <td className="px-4 py-3">{job.title}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{job.company.name}</p>
                <p className="text-xs text-slate-500">/{job.company.slug}</p>
              </td>
              <td className="px-4 py-3">{job.company.verificationStatus}</td>
              <td className="px-4 py-3">{job.status}</td>
              <td className="px-4 py-3">
                {new Date(job.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {job.status !== "PUBLISHED" && (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          approveJobAction,
                          job.id,
                          "Reason for approving this job (optional):",
                        )
                      }
                    >
                      Approve
                    </Button>
                  )}

                  {job.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isPending}
                      onClick={() =>
                        runAction(
                          rejectJobAction,
                          job.id,
                          "Reason for rejecting this job:",
                        )
                      }
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
