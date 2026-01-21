import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, MessagesSquare, CheckCircle2 } from "lucide-react";

interface StatsOverviewProps {
  stats: {
    activeJobs: number;
    totalApplicants: number;
    totalHired: number;
    activeInterviews: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-200/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-violet-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeJobs}</div>
          <p className="text-xs text-muted-foreground">
            Current open positions
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
          <div className="text-2xl font-bold">{stats.totalApplicants}</div>
          <p className="text-xs text-muted-foreground">Across all jobs</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-200/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hired</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHired}</div>
          <p className="text-xs text-muted-foreground">Candidates joined</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interviews</CardTitle>
          <MessagesSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeInterviews}</div>
          <p className="text-xs text-muted-foreground">Scheduled this week</p>
        </CardContent>
      </Card>
    </div>
  );
}
