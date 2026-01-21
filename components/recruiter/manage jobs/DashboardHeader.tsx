import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, UserCheck } from "lucide-react";

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
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-200/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-violet-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalJobs}</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Applicants
          </CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCandidates}</div>
          <p className="text-xs text-muted-foreground">
            Across all active jobs
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-200/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Hired Candidates
          </CardTitle>
          <UserCheck className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">+2 since last week</p>
        </CardContent>
      </Card>
    </div>
  );
}
