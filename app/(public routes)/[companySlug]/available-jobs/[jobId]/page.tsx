import JobDetailsDataContainer from "@/components/companySlug/jobDetails/JobDetailsDataContainer";
import JobDetailsSkeleton from "@/components/companySlug/jobDetails/JobDetailsSkeleton";
import { Suspense } from "react";

import { Metadata } from "next";
import { prisma } from "@/prisma/prisma";

type Params = Promise<{ companySlug: string; jobId: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { jobId } = await params;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { Company: true },
  });

  if (!job) {
    return {
      title: "Job Not Found",
      description: "The requested job posting could not be found.",
    };
  }

  return {
    title: `${job.title} at ${job.Company.name}`,
    description: `${job.summary.slice(0, 150)}...`,
    openGraph: {
      title: `${job.title} at ${job.Company.name}`,
      description: job.summary.slice(0, 150),
      images: [job.Company.image || "/og-placeholder.jpg"],
    },
  };
}

const JobDetailsPage = async ({ params }: { params: Params }) => {
  const { jobId } = await params;

  // Fetch data for Structured Data (JSON-LD)
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { Company: true },
  });

  if (!job) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.summary,
    datePosted: job.createdAt.toISOString(),
    validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Approx 30 days
    employmentType: job.jobType,
    hiringOrganization: {
      "@type": "Organization",
      name: job.Company.name,
      sameAs: `https://clarityhire.com/${job.Company.slug}`,
      logo: job.Company.image,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "US", // Defaulting, ideally dynamic
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: "MONTH",
      },
    },
  };

  return (
    <div className="relative w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<JobDetailsSkeleton />}>
        <JobDetailsDataContainer id={jobId} />
      </Suspense>
    </div>
  );
};

export default JobDetailsPage;
