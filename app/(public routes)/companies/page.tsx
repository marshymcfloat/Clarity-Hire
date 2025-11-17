import CompaniesDataContainer from "@/components/companies/CompaniesDataContainer";
import CompaniesGridSkeleton from "@/components/companies/CompaniesGridSkeleton";
import { Suspense } from "react";

const CompaniesPage = () => {
  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 h-screen">
      <div className="mb-8 space-y-2 text-center ">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Explore Opportunities
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover innovative companies and find your next great role.
        </p>
      </div>

      <Suspense fallback={<CompaniesGridSkeleton />}>
        <CompaniesDataContainer />
      </Suspense>
    </main>
  );
};

export default CompaniesPage;
