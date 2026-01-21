import AvailableJobsList from "./AvailableJobsList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAvailableJobs } from "@/lib/data/job-board";

const AvailableJobsDataContainer = async ({
  companySlug,
}: {
  companySlug: string;
}) => {
  const session = await getServerSession(authOptions);
  const availableJobs = await getAvailableJobs(companySlug, session?.user?.id);

  return <AvailableJobsList jobs={availableJobs} companySlug={companySlug} />;
};

export default AvailableJobsDataContainer;
