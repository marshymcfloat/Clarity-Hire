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
import { ApplicationStatus } from "@prisma/client";
import Link from "next/link";
import UpdateStatusDialog from "./UpdateStatusDialog";
import RejectApplicationDialog from "./RejectApplicationDialog";
import React from "react";

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
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback>
              {user.name?.slice(0, 2).toUpperCase() || "UN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name || "Unknown"}</span>
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Job Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="pl-4">{row.original.Job.title}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ApplicationStatus;

      const statusColors: Record<ApplicationStatus, string> = {
        SUBMITTED: "bg-blue-500",
        IN_REVIEW: "bg-yellow-500",
        INTERVIEWING: "bg-purple-500",
        OFFERED: "bg-green-500",
        HIRED: "bg-emerald-600",
        REJECTED: "bg-red-500",
        WITHDRAWN: "bg-gray-500",
      };

      return (
        <Badge
          className={`${statusColors[status]} hover:${statusColors[status]} text-white border-0`}
        >
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Applied Date",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
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
        return <span className="text-muted-foreground text-sm">No Resume</span>;
      }
      return (
        <Link
          href={resume.url}
          target="_blank"
          className="flex items-center text-primary hover:underline"
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
