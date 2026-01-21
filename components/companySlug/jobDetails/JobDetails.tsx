import {
  Job,
  Company,
  ExperienceLevel,
  JobType,
  WorkArrangement,
} from "@prisma/client";
import { Building2, FileText, TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import {
  EXPERIENCE_LEVEL_MAP,
  JOB_TYPE_MAP,
  WORK_ARRANGEMENT_MAP,
} from "@/constants";
import { formatSalary, getInitials } from "@/lib/utils";
import ApplyJobSheet from "./ApplyJobSheet";

type JobWithCompany = Job & { Company: Company };

const JobMiniDetails = ({
  arrangement,
  type,
  experience,
}: {
  arrangement: WorkArrangement;
  type: JobType;
  experience: ExperienceLevel;
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge
      variant="secondary"
      className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
    >
      <Building2 size={13} /> {WORK_ARRANGEMENT_MAP[arrangement]}
    </Badge>
    <Badge
      variant="secondary"
      className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300"
    >
      <FileText size={13} /> {JOB_TYPE_MAP[type]}
    </Badge>
    <Badge
      variant="secondary"
      className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
    >
      <TrendingUp size={13} /> {EXPERIENCE_LEVEL_MAP[experience]}
    </Badge>
  </div>
);

const JobDetails = ({
  jobDetails,
  jobId,
}: {
  jobDetails: JobWithCompany;
  jobId: string;
}) => {
  const {
    Company,
    benefits,
    experienceLevel,
    jobType,
    location,
    qualifications,
    responsibilities,
    salaryMax,
    salaryMin,
    skills,
    summary,
    title,
    workArrangement,
  } = jobDetails;

  return (
    <div className="w-full h-full p-0 md:p-8 space-y-8 overflow-y-auto relative bg-slate-50/50 dark:bg-black/20">
      <Card className="border-b shadow-sm ring-0 rounded-none md:rounded-xl sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-all duration-200">
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-slate-100 dark:border-zinc-800 shadow-sm shrink-0">
                <AvatarImage
                  src={Company.image || undefined}
                  alt={`${Company.name} logo`}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl md:text-2xl font-bold bg-violet-100 text-violet-600">
                  {getInitials(Company.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 md:space-y-3 w-full">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm md:text-base text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{Company.name}</span>
                    </div>
                    <span>•</span>
                    <span className="text-slate-500">{location}</span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <JobMiniDetails
                    arrangement={workArrangement}
                    experience={experienceLevel}
                    type={jobType}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center justify-between md:flex-col md:items-end gap-4 md:min-w-[200px] w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-zinc-800">
              <div className="flex flex-col items-start md:items-end">
                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {formatSalary(salaryMin, salaryMax)}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">
                  per month
                </p>
              </div>
              <ApplyJobSheet
                jobTitle={jobDetails.title}
                jobSummary={jobDetails.summary}
                jobId={jobId}
              />
            </div>

            <div className="md:hidden w-full pt-2">
              <JobMiniDetails
                arrangement={workArrangement}
                experience={experienceLevel}
                type={jobType}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="px-4 md:px-0 grid grid-cols-1 gap-8 md:gap-12 md:grid-cols-3 max-w-7xl mx-auto">
        <div className="space-y-10 md:col-span-2">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
              Job Summary
            </h2>
            <p className="text-muted-foreground leading-relaxed">{summary}</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
              Responsibilities
            </h2>
            <ul className="grid gap-3">
              {responsibilities.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
              Qualifications
            </h2>
            <ul className="grid gap-3">
              {qualifications.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-8 md:col-span-1">
          {skills.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Skills Required
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-slate-300 font-normal"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {benefits.length > 0 && (
            <div className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-6 rounded-xl border border-violet-100/50 dark:border-violet-900/20">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-violet-600/80 dark:text-violet-400/80">
                Perks & Benefits
              </h3>
              <ul className="space-y-3">
                {benefits.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <div className="p-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shrink-0">
                      <TrendingUp size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
