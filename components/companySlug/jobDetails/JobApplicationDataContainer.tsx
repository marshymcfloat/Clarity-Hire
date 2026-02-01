import { prisma } from "@/prisma/prisma";
import JobForm from "./JobForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resume } from "@/lib/generated/prisma/client";
import LoginRequiredState from "./LoginRequiredState";

const JobApplicationDataContainer = async ({ jobId }: { jobId: string }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <LoginRequiredState />;
  }

  const questionJobs = await prisma.questionOnJob.findMany({
    where: { jobId },
    include: {
      Question: true,
    },
  });

  const allResumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const userResumes = Array.from(
    new Map<string, Resume>(
      allResumes.map(
        (resume: Resume) => [resume.name, resume] as [string, Resume],
      ),
    ).values(),
  );

  return (
    <JobForm questions={questionJobs} resumes={userResumes} jobId={jobId} />
  );
};

export default JobApplicationDataContainer;
