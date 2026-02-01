import { ConfiguredComapnies } from "@/types";
import CompanyCard from "./CompanyCard";

const CompaniesList = ({ companies }: { companies: ConfiguredComapnies[] }) => {
  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <p className="font-space font-bold text-xl text-slate-800 mb-2">
          No companies found
        </p>
        <p className="text-slate-500">
          Check back later or try refining your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          name={company.name}
          description={company.description}
          slug={company.slug}
          image={company.image}
          location={company.location}
        />
      ))}
    </div>
  );
};

export default CompaniesList;
