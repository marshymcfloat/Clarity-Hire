import { Prisma } from "@prisma/client";

export type ConfiguredComapnies = Prisma.CompanyGetPayload<{
  select: {
    id: true;
    coverImage: true;
    name: true;
    image: true;
    description: true;
    location: true;
    slug: true;
    websiteUrl: true;
  };
}>;

export type JobCardData = Prisma.JobGetPayload<{
  select: {
    id: true;
    title: true;
    summary: true;
    experienceLevel: true;
    jobType: true;
    location: true;
    createdAt: true;
  };
}>;
