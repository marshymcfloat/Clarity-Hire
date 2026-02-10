"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CandidateSearchFilters,
  SearchFilters,
} from "@/components/candidates/CandidateSearchFilters";
import {
  CandidateResultCard,
  CandidateResult,
} from "@/components/candidates/CandidateResultCard";
import { Loader2, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCompanyJobsAction } from "@/app/actions/job";

interface SemanticSearchResponse {
  results: CandidateResult[];
  total: number;
  query: string;
  executionTime: number;
}

export default function CandidateSearchPageClient() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    minExperience: 0,
    skills: "",
    onlyApplicants: false,
    jobId: undefined,
  });

  const { data: jobs } = useQuery({
    queryKey: ["company-jobs"],
    queryFn: async () => {
      try {
        return (await getCompanyJobsAction()) || [];
      } catch (e) {
        console.error("Failed to fetch jobs", e);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data, isLoading, isError, error, refetch } =
    useQuery<SemanticSearchResponse>({
      queryKey: ["semantic-search", filters],
      queryFn: async () => {
        const skillList = filters.skills
          ? filters.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

        const payload = {
          query: filters.query || "experienced candidates",
          jobId: filters.jobId || undefined,
          filters: {
            location: filters.location || undefined,
            minExperience: filters.minExperience || undefined,
            skills: skillList,
            onlyApplicants: filters.onlyApplicants || undefined,
          },
          limit: 20,
        };

        if (
          !filters.query &&
          !payload.filters.location &&
          !payload.filters.skills &&
          !payload.filters.onlyApplicants &&
          !payload.jobId
        ) {
          return {
            results: [],
            total: 0,
            query: "",
            executionTime: 0,
          };
        }

        const res = await fetch("/api/candidates/semantic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
          }

          const err = await res.json();
          throw new Error(err.message || "Failed to fetch candidates");
        }

        return res.json();
      },
      enabled: true,
      staleTime: 1000 * 60 * 5,
    });

  const handleViewReport = (candidateId: string) => {
    if (!filters.jobId) {
      toast.info(
        "Please select a job from the filters to view a detailed match report.",
        {
          description:
            "The analysis requires a specific job description to compare against.",
          duration: 4000,
        },
      );
      return;
    }

    router.push(`/candidates/${candidateId}/match-report?jobId=${filters.jobId}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-space font-bold text-primary">
          Candidate Search
        </h1>
        <p className="text-muted-foreground">
          Find the best talent using AI-powered semantic search.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-80 flex-shrink-0">
          <CandidateSearchFilters onFiltersChange={setFilters} jobs={jobs || []} />
        </aside>

        <main className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground">Searching candidate data...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-destructive/20 rounded-lg bg-destructive/5">
              <p className="text-destructive font-semibold mb-2">
                Error searching candidates
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : !data || data.results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center opacity-75">
              <SearchX className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No candidates found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-2">
                Found {data.results.length} candidates
                {filters.jobId && " for selected job"}
              </p>
              {data.results.map((candidate) => (
                <CandidateResultCard
                  key={candidate.candidateId}
                  candidate={{
                    ...candidate,
                    name: candidate.name || "Anonymous Candidate",
                    email: candidate.email,
                    location: candidate.location || "Unknown",
                    skills: candidate.skills || [],
                    matchExplanation: filters.jobId
                      ? "Match score based on semantic similarity to selected job."
                      : "Matched based on semantic similarity to your query.",
                  }}
                  onViewReport={handleViewReport}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
