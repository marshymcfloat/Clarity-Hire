import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";
import AvailableJobsList from "@/components/available-jobs/AvailableJobsList";
import { redirect } from "next/navigation";

export default async function SavedJobsPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const savedJobs = await prisma.savedJob.findMany({
    where: {
      userId: session.user.id,
      job: {
        Company: {
          slug: companySlug,
        },
      },
    },
    include: {
      job: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedJobs = savedJobs.map((saved: (typeof savedJobs)[number]) => ({
    ...saved.job,
    isSaved: true,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>
      <AvailableJobsList jobs={formattedJobs} companySlug={companySlug} />
    </div>
  );
}
