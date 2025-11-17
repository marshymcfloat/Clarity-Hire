import StatCardInitialDataContainer from "@/components/recruiter/dashboard/StatCardInitialDataContainer";
import StatCardSkeleton from "@/components/recruiter/dashboard/StatCardSkeleton";
import { Suspense } from "react";

const RecruiterDashboardPage = () => {
  return (
    <section className=" h-full p-4">
      <Suspense fallback={<StatCardSkeleton />}>
        <StatCardInitialDataContainer />
      </Suspense>
    </section>
  );
};

export default RecruiterDashboardPage;
