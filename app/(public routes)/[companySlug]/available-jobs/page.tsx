import AvailableJobsDataContainer from "@/components/available-jobs/AvailableJobsDataContainer";
import AvailableJobsListSkeleton from "@/components/available-jobs/AvailableJobsListSkeleton";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import ProgressLink from "@/components/ui/ProgressLink";

import { Metadata } from "next";

type Params = Promise<{ companySlug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { companySlug } = await params;
  const companyName = companySlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${companyName} Careers`,
    description: `Explore exciting job opportunities and join the team at ${companyName}.`,
    openGraph: {
      title: `${companyName} Careers | ClarityHire`,
      description: `View all open positions at ${companyName}.`,
    },
  };
}

const page = async ({ params }: { params: Params }) => {
  const { companySlug } = await params;

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-50/80 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/80 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015]"></div>
      </div>

      <div className="relative z-10 flex flex-col w-full h-full max-w-7xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <ProgressLink
            href="/companies"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Companies
          </ProgressLink>
          <h1 className="font-space font-bold text-3xl md:text-5xl tracking-tight text-slate-900 capitalize">
            {companySlug.replace(/-/g, " ")}{" "}
            <span className="text-indigo-600">Careers</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Explore open roles and join the team.
          </p>
        </div>

        <Suspense fallback={<AvailableJobsListSkeleton />}>
          <AvailableJobsDataContainer companySlug={companySlug} />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
