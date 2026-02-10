import { MatchReport } from "@/components/candidates/MatchReport";
import { authOptions } from "@/lib/auth";
import { generateMatchReport } from "@/lib/rag/match-report";
import { getRecruiterContext, JOB_MANAGEMENT_ROLES } from "@/lib/security";
import { prisma } from "@/prisma/prisma";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

interface MatchReportPageProps {
  params: Promise<{ candidateId: string }>;
  searchParams: Promise<{ jobId?: string }>;
}

export default async function MatchReportPage(props: MatchReportPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  const searchParams = await props.searchParams;
  const params = await props.params;

  const { candidateId } = params;
  const { jobId } = searchParams;

  if (!jobId) {
    return (
      <div className="container mx-auto p-8 text-center animate-fade-in">
        <h1 className="text-2xl font-bold mb-4 font-space">
          Job Context Missing
        </h1>
        <p className="text-muted-foreground">
          Please select a job from the search page to view a match report.
        </p>
      </div>
    );
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { title: true, companyId: true },
  });

  if (!job) {
    notFound();
  }

  const access = await getRecruiterContext(session.user.id, {
    companyId: job.companyId,
    allowedMemberRoles: JOB_MANAGEMENT_ROLES,
  });

  if (!access.authorized) {
    notFound();
  }

  const candidate = await prisma.user.findUnique({
    where: { id: candidateId },
    select: { name: true, email: true },
  });

  if (!candidate) {
    notFound();
  }

  try {
    const report = await generateMatchReport(candidateId, jobId, {
      companyId: access.companyId,
    });

    const reportData = {
      matchScore: report.score,
      analysis: {
        skillsMatch: report.skillsMatch,
        experienceMatch: {
          ...report.experienceMatch,
          relevantRoles: report.experienceMatch.relevantRoles,
        },
        educationMatch: report.educationMatch,
        culturalFit: report.culturalFit,
        salaryFit: report.salaryFit,
        executiveSummary: report.executiveSummary,
      },
      candidateName: candidate.name || "Candidate",
      jobTitle: job.title,
    };

    return (
      <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-fade-in">
        <MatchReport data={reportData} />
      </div>
    );
  } catch (error) {
    console.error("Error generating match report:", error);
    return (
      <div className="container mx-auto p-8 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-destructive mb-4">
          Analysis Failed
        </h1>
        <p className="text-muted-foreground">
          Could not generate the match report at this time.
        </p>
        <p className="text-sm mt-2 font-mono bg-muted p-2 rounded inline-block">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}
