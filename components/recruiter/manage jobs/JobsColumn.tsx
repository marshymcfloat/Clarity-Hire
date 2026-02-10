"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { Ellipsis, Trash } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditJobDialog from "./EditJobDialog";
import SubmitForReviewButton from "./SubmitForReviewButton";
import { Job, JobStatus, QuestionOnJob } from "@/lib/generated/prisma/client";

export const jobColumns: ColumnDef<
  Job & { QuestionOnJob: QuestionOnJob[] } & {
    _count?: { Application: number };
  }
>[] = [
  { accessorKey: "title", header: "Job Title" },
  {
    id: "applicants",
    header: "Applicants",
    cell: ({ row }) => {
      const count = row.original._count?.Application || 0;
      return (
        <div className="flex items-center gap-1">
          <span className="font-medium">{count}</span>
        </div>
      );
    },
  },
  { accessorKey: "department", header: "Department" },
  {
    accessorKey: "createdAt",
    header: "Created at",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: JobStatus = row.getValue("status");

      return (
        <Badge
          variant="secondary"
          className={clsx("capitalize font-normal border shadow-sm", {
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20":
              status === "PUBLISHED",
            "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700":
              status === "DRAFT",
            "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20":
              status === "PENDING_REVIEW",
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20":
              status === "REJECTED",
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20":
              status === "ARCHIVED",
          })}
        >
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {job.status !== "PUBLISHED" && job.status !== "PENDING_REVIEW" && (
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <SubmitForReviewButton jobId={job.id} />
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <EditJobDialog job={job} />
            </DropdownMenuItem>

            <DropdownMenuItem className="">
              <Trash color="red" /> <p className="text-red-600">Delete</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
