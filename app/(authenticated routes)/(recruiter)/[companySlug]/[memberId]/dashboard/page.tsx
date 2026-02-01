import StatCardInitialDataContainer from "@/components/recruiter/dashboard/StatCardInitialDataContainer";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const RecruiterDashboardPage = async () => {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Recruiter";

  return (
    <section className="h-full p-8 max-w-[1600px]  mx-auto space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold font-space text-slate-900 dark:text-slate-100 tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your recruitment pipeline
          today.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-96 w-full animate-pulse bg-slate-100 dark:bg-slate-900/50 rounded-xl" />
        }
      >
        <StatCardInitialDataContainer />
      </Suspense>
    </section>
  );
};

export default RecruiterDashboardPage;
