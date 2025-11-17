import { Job } from "@prisma/client";
import { MapPin, TrendingUp, Clock } from "lucide-react";

import { EXPERIENCE_LEVEL_MAP, JOB_TYPE_MAP } from "@/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { formatPostedDate } from "@/lib/utils";
import ProgressLink from "../ui/ProgressLink";

interface JobCardProps {
  job: Job;
  companySlug: string;
}

const JobCard = ({ job, companySlug }: JobCardProps) => {
  return (
    <ProgressLink
      href={`/${companySlug}/available-jobs/${job.id}`}
      className="block h-full"
    >
      <Card className="flex h-full flex-col transition-all duration-200 hover:border-primary hover:shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold leading-tight">
            {job.title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="secondary" className="flex i  tems-center gap-1.5">
              <MapPin size={14} />
              {job.location}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <TrendingUp size={14} />
              {EXPERIENCE_LEVEL_MAP[job.experienceLevel]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="line-clamp-3">
            {job.summary}
          </CardDescription>
        </CardContent>
        <CardFooter className="pt-4 text-xs text-muted-foreground">
          <div className="flex w-full items-center justify-between">
            <span>{JOB_TYPE_MAP[job.jobType]}</span>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Posted {formatPostedDate(job.createdAt)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </ProgressLink>
  );
};

export default JobCard;
