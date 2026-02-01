import Link from "next/link";
import {
  Job,
  Company,
  ExperienceLevel,
  JobType,
  WorkArrangement,
} from "@prisma/client";
import {
  ArrowLeft,
  Building2,
  FileText,
  TrendingUp,
  MapPin,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  EXPERIENCE_LEVEL_MAP,
  JOB_TYPE_MAP,
  WORK_ARRANGEMENT_MAP,
} from "@/constants";
import { formatSalary, getInitials } from "@/lib/utils";
import ApplyJobSheet from "./ApplyJobSheet";

type JobWithCompany = Job & { Company: Company };

const DetailPill = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
      {label}
    </span>
    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
      <Icon className="w-4 h-4 text-indigo-500" />
      {value}
    </div>
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
    <div className="relative w-full min-h-full text-slate-900">
      <div className="sticky top-4 z-50 bg-white/40 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto ">
            <Link
              href={`/${Company.slug}/available-jobs`}
              className="mr-2 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Avatar className="h-12 w-12 rounded-xl border border-slate-100 bg-white">
              <AvatarImage
                src={Company.image || undefined}
                className="object-cover"
              />
              <AvatarFallback className="font-bold bg-indigo-50 text-indigo-600 text-lg">
                {getInitials(Company.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-space font-bold text-xl md:text-2xl text-slate-900 leading-tight">
                {title}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="font-medium text-slate-700">
                  {Company.name}
                </span>
                <span className="text-slate-300">•</span>
                <span>{location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-bold text-lg text-slate-900">
                {formatSalary(salaryMin, salaryMax)}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                Monthly Salary
              </span>
            </div>
            <ApplyJobSheet
              jobTitle={jobDetails.title}
              jobSummary={jobDetails.summary}
              jobId={jobId}
              // Updated trigger styling inside the sheet typically, or wrapper here
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="font-space font-bold text-xl text-slate-900 mb-4 flex items-center gap-2">
              About the Role
            </h2>
            <p className="text-slate-600 leading-7 text-lg">{summary}</p>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
            <DetailPill
              icon={Building2}
              label="Arrangement"
              value={WORK_ARRANGEMENT_MAP[workArrangement]}
            />
            <DetailPill
              icon={FileText}
              label="Type"
              value={JOB_TYPE_MAP[jobType]}
            />
            <DetailPill
              icon={TrendingUp}
              label="Experience"
              value={EXPERIENCE_LEVEL_MAP[experienceLevel]}
            />
            <DetailPill
              icon={DollarSign}
              label="Salary"
              value={formatSalary(salaryMin, salaryMax).split(" ")[0]}
            />{" "}
          </section>

          <section>
            <h2 className="font-space font-bold text-xl text-slate-900 mb-6">
              Key Responsibilities
            </h2>
            <ul className="space-y-4">
              {responsibilities.map((item, i) => (
                <li key={i} className="flex items-start gap-4 group">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 group-hover:scale-125 transition-transform" />
                  <span className="text-slate-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-space font-bold text-xl text-slate-900 mb-6">
              Qualifications
            </h2>
            <ul className="space-y-4">
              {qualifications.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-space font-bold text-slate-900 mb-4">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {benefits.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
              <h3 className="font-space font-bold mb-6 text-indigo-100 uppercase tracking-widest text-xs">
                Perks & Benefits
              </h3>
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm font-medium"
                  >
                    <div className="p-1 rounded-full bg-white/20 shrink-0">
                      <TrendingUp className="w-3 h-3 text-white" />
                    </div>
                    <span className="leading-snug text-indigo-50">
                      {benefit}
                    </span>
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
