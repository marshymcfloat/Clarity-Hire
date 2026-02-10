import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { prisma } from "@/lib/prisma"; // Assuming prisma instance path
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth"; // Assuming auth
import { authOptions } from "@/lib/auth"; // Assuming auth options path

interface ApplyPageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function ApplyPage(props: ApplyPageProps) {
  const params = await props.params;
  const { jobId } = params;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      companyId: true,
      Company: { select: { name: true } },
    },
  });

  if (!job) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl font-space font-bold tracking-tight">
          Apply for {job.title}
        </h1>
        <p className="text-muted-foreground text-lg">at {job.Company?.name}</p>
      </div>

      <ApplicationForm
        jobId={job.id}
        jobTitle={job.title}
        userId={session?.user?.id}
        userEmail={session?.user?.email || undefined}
      />
    </div>
  );
}
