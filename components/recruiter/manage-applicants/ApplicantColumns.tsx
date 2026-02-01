"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Link from "next/link";
import UpdateStatusDialog from "./UpdateStatusDialog";
import RejectApplicationDialog from "./RejectApplicationDialog";
import React from "react";
import { ApplicationStatus } from "@/lib/generated/prisma/enums";

export type Applicant = {
  id: string;
  status: ApplicationStatus;
  createdAt: Date;
  Job: {
    title: string;
    id: string;
  };
  User: {
    name: string | null;
    email: string;
    image: string | null;
  };
  Resume: {
    url: string;
    name: string;
  };
};

export const applicantColumns: ColumnDef<Applicant>[] = [
  {
    accessorFn: (row) => row.User.name,
    id: "candidateName",
    header: "Candidate",
    cell: ({ row }) => {
      const user = row.original.User;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-950 shadow-sm">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="bg-violet-100 text-violet-700 font-bold text-xs">
              {user.name?.slice(0, 2).toUpperCase() || "UN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {user.name || "Unknown"}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.Job.title,
    id: "jobTitle",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-xs font-space font-semibold uppercase tracking-wider pl-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Job Title
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-slate-700 dark:text-slate-300">
        {row.original.Job.title}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ApplicationStatus;

      const secondaryVariant = {
        SUBMITTED:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
        IN_REVIEW:
          "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
        INTERVIEWING:
          "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
        OFFERED:
          "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20",
        HIRED:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        REJECTED:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
        WITHDRAWN:
          "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      };

      return (
        <Badge
          variant="secondary"
          className={`font-normal border shadow-sm capitalize ${secondaryVariant[status]}`}
        >
          {status.replace("_", " ").toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Applied Date",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground font-mono text-xs">
          {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "resume",
    header: "Resume",
    cell: ({ row }) => {
      const resume = row.original.Resume;
      if (!resume || !resume.url) {
        return (
          <span className="text-muted-foreground text-xs italic">
            No Resume
          </span>
        );
      }
      return (
        <Link
          href={resume.url}
          target="_blank"
          className="flex items-center text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
        >
          <FileText className="mr-2 h-4 w-4" />
          View
        </Link>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell application={row.original} />,
  },
];

const ActionCell = ({ application }: { application: Applicant }) => {
  const [open, setOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);

  return (
    <>
      <UpdateStatusDialog
        applicationId={application.id}
        currentStatus={application.status}
        open={open}
        onOpenChange={setOpen}
      />
      <RejectApplicationDialog
        applicationId={application.id}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(application.User.email)
            }
          >
            Copy Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Update Status
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 bg-red-50 dark:bg-red-950/20"
            onClick={() => setRejectOpen(true)}
          >
            Reject Application
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
