import CandidateSearchPageClient from "@/components/candidates/CandidateSearchPageClient";
import { authOptions } from "@/lib/auth";
import { getRecruiterContext, JOB_MANAGEMENT_ROLES } from "@/lib/security";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function CandidateSearchPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  const access = await getRecruiterContext(session.user.id, {
    allowedMemberRoles: JOB_MANAGEMENT_ROLES,
  });

  if (!access.authorized) {
    notFound();
  }

  return <CandidateSearchPageClient />;
}
