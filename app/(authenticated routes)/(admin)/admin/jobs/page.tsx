import JobAdminTable from "@/components/admin/JobAdminTable";
import { requirePlatformAdmin } from "@/lib/server-auth";
import { prisma } from "@/prisma/prisma";
import { redirect } from "next/navigation";

export default async function AdminJobsPage() {
  const auth = await requirePlatformAdmin();
  if (!auth.authorized) {
    redirect("/");
  }

  const jobs = await prisma.job.findMany({
    where: {
      status: {
        in: ["PENDING_REVIEW", "DRAFT", "REJECTED", "PUBLISHED"],
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      Company: {
        select: {
          id: true,
          name: true,
          slug: true,
          verificationStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    createdAt: job.createdAt,
    company: {
      id: job.Company.id,
      name: job.Company.name,
      slug: job.Company.slug,
      verificationStatus: job.Company.verificationStatus,
    },
  }));

  return (
    <section className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin: Job Moderation</h1>
        <p className="text-sm text-muted-foreground">
          Approve or reject jobs before public publishing.
        </p>
      </div>
      <JobAdminTable jobs={rows} />
    </section>
  );
}
