import CompaniesDataContainer from "@/components/companies/CompaniesDataContainer";
import CompaniesGridSkeleton from "@/components/companies/CompaniesGridSkeleton";
import React, { Suspense } from "react";

export const dynamic = "force-dynamic";

const CompaniesPage = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-50/80 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/80 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 md:py-20">
        <div className="mb-12 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm text-xs font-mono text-slate-500 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
            Hire Top Talent
          </div>
          <h1 className="font-space font-bold text-4xl md:text-6xl tracking-tighter text-slate-900">
            Explore Opportunities
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-light leading-relaxed">
            Discover innovative companies and find your next great role with{" "}
            <span className="text-indigo-600 font-medium">transparency</span>.
          </p>
        </div>

        <Suspense fallback={<CompaniesGridSkeleton />}>
          <CompaniesDataContainer />
        </Suspense>
      </div>
    </main>
  );
};

export default CompaniesPage;
