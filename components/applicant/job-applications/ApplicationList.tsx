"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Building2, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import {
  Application,
  ApplicationStatus,
  WorkArrangement,
} from "@/lib/generated/prisma/client";

type ApplicationWithJob = Application & {
  Job: {
    id: string;
    title: string;
    location: string;
    workArrangement: WorkArrangement;
    Company: {
      name: string;
      image: string | null;
      slug: string;
    };
  };
};

interface ApplicationListProps {
  applications: ApplicationWithJob[];
}

export default function ApplicationList({
  applications,
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No applications yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
          You haven&apos;t applied to any jobs yet. Start exploring available
          positions to take the next step in your career.
        </p>
        <Button asChild>
          <Link href="/companies">Browse Jobs</Link>
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25 border-blue-200 dark:border-blue-900";
      case "IN_REVIEW":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25 border-yellow-200 dark:border-yellow-900";
      case "INTERVIEWING":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-400 hover:bg-purple-500/25 border-purple-200 dark:border-purple-900";
      case "OFFERED":
        return "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 border-green-200 dark:border-green-900";
      case "HIRED":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-200 dark:border-emerald-900";
      case "REJECTED":
        return "bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25 border-red-200 dark:border-red-900";
      case "WITHDRAWN":
        return "bg-gray-500/15 text-gray-700 dark:text-gray-400 hover:bg-gray-500/25 border-gray-200 dark:border-gray-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {applications.map((app) => (
        <Card
          key={app.id}
          className="group flex flex-col h-full hover:shadow-xl transition-all duration-300 border-none bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800"
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div className="flex items-center gap-4 w-full">
              <div className="relative group-hover:scale-105 transition-transform duration-300">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                  <AvatarImage
                    src={app.Job.Company.image || undefined}
                    alt={app.Job.Company.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 font-bold">
                    {app.Job.Company.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <Link
                  href={`/${app.Job.Company.slug}/available-jobs/${app.Job.id}`}
                  className="font-bold text-lg leading-none tracking-tight hover:text-violet-600 transition-colors line-clamp-1 block"
                >
                  {app.Job.title}
                </Link>
                <Link
                  href={`/companies/${app.Job.Company.slug}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {app.Job.Company.name}
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge
                variant="outline"
                className={`${getStatusColor(app.status)} px-3 py-1 border-0 shadow-sm font-medium`}
              >
                {app.status.replace("_", " ")}
              </Badge>
              <Badge
                variant="secondary"
                className="font-normal text-muted-foreground bg-secondary/50"
              >
                {app.Job.workArrangement.replace("_", " ")}
              </Badge>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground p-3 bg-muted/40 rounded-lg">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-violet-500/70" />
                <span className="font-medium">{app.Job.location}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-violet-500/70" />
                <span>
                  Applied on{" "}
                  {new Date(app.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 mt-auto pb-4 px-6">
            <Button
              className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900 transition-all shadow-sm hover:shadow"
              asChild
            >
              <Link
                href={`/${app.Job.Company.slug}/available-jobs/${app.Job.id}`}
              >
                View Application Details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
