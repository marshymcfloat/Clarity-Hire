import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import { getServerSession } from "next-auth";
import StatsOverview from "./StatsOverview";
import RecentActivityFeed from "./RecentActivityFeed";

const StatCardInitialDataContainer = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.activeCompanyId) return null;

  const [
    activeJobs,
    totalApplicants,
    recentApplications,
    totalHired,
    activeInterviews,
  ] = await Promise.all([
    prisma.job.count({
      where: { companyId: session.user.activeCompanyId, status: "PUBLISHED" },
    }),
    prisma.application.count({
      where: { Job: { companyId: session.user.activeCompanyId } },
    }),
    prisma.application.findMany({
      where: { Job: { companyId: session.user.activeCompanyId } },
      include: {
        Job: { select: { title: true } },
        User: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.application.count({
      where: {
        Job: { companyId: session.user.activeCompanyId },
        status: "HIRED",
      },
    }),
    prisma.application.count({
      where: {
        Job: { companyId: session.user.activeCompanyId },
        status: "INTERVIEWING",
      },
    }),
  ]);

  const formattedActivities = recentApplications.map((app: any) => ({
    id: app.id,
    type: "APPLICATION" as const,
    candidateName: app.User.name || "Unknown Candidate",
    active: true,
    candidateAvatar: app.User.image,
    jobTitle: app.Job.title,
    timestamp: app.createdAt,
  }));

  const stats = {
    activeJobs,
    totalApplicants,
    totalHired,
    activeInterviews,
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <StatsOverview stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-full">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Analytics Chart Coming Soon</p>
        </div>

        <RecentActivityFeed activities={formattedActivities} />
      </div>
    </div>
  );
};

export default StatCardInitialDataContainer;
