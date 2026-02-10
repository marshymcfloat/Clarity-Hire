import CompanyAdminTable from "@/components/admin/CompanyAdminTable";
import { requirePlatformAdmin } from "@/lib/server-auth";
import { prisma } from "@/prisma/prisma";
import { redirect } from "next/navigation";

export default async function AdminCompaniesPage() {
  const auth = await requirePlatformAdmin();
  if (!auth.authorized) {
    redirect("/");
  }

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      verificationStatus: true,
      plan: true,
      billingStatus: true,
      activePublishedJobsLimit: true,
      verificationRequestedAt: true,
      verifiedAt: true,
      User: {
        select: {
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows = companies.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    verificationStatus: company.verificationStatus,
    plan: company.plan,
    billingStatus: company.billingStatus,
    activePublishedJobsLimit: company.activePublishedJobsLimit,
    ownerEmail: company.User.email,
    verificationRequestedAt: company.verificationRequestedAt,
    verifiedAt: company.verifiedAt,
  }));

  return (
    <section className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin: Company Verification</h1>
        <p className="text-sm text-muted-foreground">
          Verify, reject, suspend, or unsuspend employer companies.
        </p>
      </div>
      <CompanyAdminTable companies={rows} />
    </section>
  );
}
