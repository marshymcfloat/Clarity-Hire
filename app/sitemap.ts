import type { MetadataRoute } from "next";
import { prisma } from "@/prisma/prisma";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: new Date() },
    { url: absoluteUrl("/pricing"), lastModified: new Date() },
    { url: absoluteUrl("/solutions"), lastModified: new Date() },
    { url: absoluteUrl("/trust"), lastModified: new Date() },
    { url: absoluteUrl("/book-demo"), lastModified: new Date() },
    { url: absoluteUrl("/companies"), lastModified: new Date() },
  ];

  const companies = await prisma.company.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const companyRoutes: MetadataRoute.Sitemap = companies.map((company) => ({
    url: absoluteUrl(`/${company.slug}/available-jobs`),
    lastModified: company.updatedAt,
  }));

  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      updatedAt: true,
      Company: {
        select: {
          slug: true,
        },
      },
    },
  });

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: absoluteUrl(`/${job.Company.slug}/available-jobs/${job.id}`),
    lastModified: job.updatedAt,
  }));

  return [...staticRoutes, ...companyRoutes, ...jobRoutes];
}
