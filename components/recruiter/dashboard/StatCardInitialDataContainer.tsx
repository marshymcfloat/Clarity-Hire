import { prisma } from "@/prisma/prisma";
import StatsOverview from "./StatsOverview";
import RecentActivityFeed from "./RecentActivityFeed";
import { Prisma } from "@/lib/generated/prisma/client";
import { JOB_MANAGEMENT_ROLES } from "@/lib/security";
import { requireRecruiterAccess } from "@/lib/server-auth";

const StatCardInitialDataContainer = async () => {
  const auth = await requireRecruiterAccess({
    allowedMemberRoles: JOB_MANAGEMENT_ROLES,
  });

  if (!auth.authorized) return null;

  type ApplicationWithDetails = Prisma.ApplicationGetPayload<{
    include: {
      Job: true;
      User: true;
    };
  }>;

  const recentApplications: ApplicationWithDetails[] =
    (await prisma.application.findMany({
      where: { Job: { companyId: auth.access.companyId } },
      include: {
        Job: true,
        User: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })) as ApplicationWithDetails[];

  const [activeJobs, totalApplicants, totalHired, activeInterviews] =
    await Promise.all([
      prisma.job.count({
        where: { companyId: auth.access.companyId, status: "PUBLISHED" },
      }),
      prisma.application.count({
        where: { Job: { companyId: auth.access.companyId } },
      }),
      prisma.application.count({
        where: {
          Job: { companyId: auth.access.companyId },
          status: "HIRED",
        },
      }),
      prisma.application.count({
        where: {
          Job: { companyId: auth.access.companyId },
          status: "INTERVIEWING",
        },
      }),
    ]);

  interface FormattedActivity {
    id: string;
    type: "APPLICATION";
    candidateName: string;
    active: boolean;
    candidateAvatar?: string;
    jobTitle: string;
    timestamp: Date;
  }

  const formattedActivities: FormattedActivity[] = recentApplications.map(
    (app) => ({
      id: app.id,
      type: "APPLICATION" as const,
      candidateName: app.User.name || "Unknown Candidate",
      active: true,
      candidateAvatar: app.User.image || undefined,
      jobTitle: app.Job.title,
      timestamp: app.createdAt,
    }),
  );

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
        <div className="md:col-span-1 lg:col-span-4 rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center max-h-[400px]">
          <p className="text-muted-foreground">Analytics Chart Coming Soon</p>
        </div>

        <RecentActivityFeed activities={formattedActivities} />
      </div>
    </div>
  );
};

export default StatCardInitialDataContainer;
