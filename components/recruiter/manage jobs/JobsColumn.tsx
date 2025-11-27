"use client";

import { Badge } from "@/components/ui/badge";
import { Job, JobStatus, QuestionOnJob } from "@prisma/client";
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

export type JobWithQuestions = Job & {
  QuestionOnJob?: QuestionOnJob[];
};

export const jobColumns: ColumnDef<JobWithQuestions>[] = [
  { accessorKey: "title", header: "Job Title" },
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
          className={clsx("capitalize", {
            "bg-green-400 text-white": status === "PUBLISHED",
            "bg-yellow-400 text-black": status === "DRAFT",
            "bg-gray-400 text-white": status === "ARCHIVED",
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
            <DropdownMenuItem>
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
