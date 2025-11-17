import { prisma } from "@/prisma/prisma";
import CompaniesList from "./CompaniesList";

const CompaniesDataContainer = async () => {
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      coverImage: true,
      name: true,
      image: true,
      description: true,
      location: true,
      slug: true,
      websiteUrl: true,
    },
  });

  if (!companies) return <h1>No companies found</h1>;

  return <CompaniesList companies={companies} />;
};

export default CompaniesDataContainer;
