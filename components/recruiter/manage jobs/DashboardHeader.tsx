import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Eye } from "lucide-react";

interface DashboardHeaderProps {
  stats: {
    totalJobs: number;
    activeCandidates: number;
    totalViews: number;
  };
}

export default function DashboardHeader({ stats }: DashboardHeaderProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Jobs */}
      <Card className="group relative overflow-hidden border-violet-100 bg-white dark:border-violet-900/30 dark:bg-slate-950/50 shadow-sm transition-all hover:shadow-md hover:border-violet-200">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Briefcase className="h-24 w-24 text-violet-600 rotate-12" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Jobs
          </CardTitle>
          <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
            <Briefcase className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-space text-slate-900 dark:text-white mt-2">
            {stats.totalJobs}
          </div>
          <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mt-1">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>

      {/* Active Candidates */}
      <Card className="group border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/50 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Applicants
          </CardTitle>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-space text-slate-900 dark:text-white mt-2">
            {stats.activeCandidates}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all active jobs
          </p>
        </CardContent>
      </Card>

      {/* Total Views */}
      <Card className="group border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/50 shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Views
          </CardTitle>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-space text-slate-900 dark:text-white mt-2">
            {stats.totalViews}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Job post impressions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
