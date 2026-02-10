"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, MapPin, FileText, ChevronRight } from "lucide-react";

// Helper for match score color
const getScoreColor = (score: number) => {
  if (score >= 85)
    return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20";
  if (score >= 70)
    return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
  return "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20";
};

export interface CandidateResult {
  candidateId: string;
  name: string;
  email: string;
  location?: string;
  skills: string[];
  matchScore: number;
  matchExplanation?: string;
  resumeUrl?: string; // Signed URL ideally
}

interface CandidateResultCardProps {
  candidate: CandidateResult;
  onViewReport: (id: string) => void;
}

export function CandidateResultCard({
  candidate,
  onViewReport,
}: CandidateResultCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-border/50 group">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
          {/* Left: Info */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold font-space text-primary group-hover:text-amber-500 transition-colors">
                {candidate.name || "Anonymous Candidate"}
              </h3>
              <Badge
                variant="outline"
                className={`${getScoreColor(candidate.matchScore)} border font-mono font-bold`}
              >
                {Math.round(candidate.matchScore)}% Match
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {candidate.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {candidate.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                Experience info... {/* Placeholder if we had it */}
                Candidate
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {candidate.skills.slice(0, 5).map((skill, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs bg-muted/50 hover:bg-muted"
                >
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 5 && (
                <span className="text-xs text-muted-foreground mt-1">
                  +{candidate.skills.length - 5} more
                </span>
              )}
            </div>

            {candidate.matchExplanation && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2 italic border-l-2 border-primary/20 pl-3">
                "{candidate.matchExplanation}"
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
            <Button
              onClick={() => onViewReport(candidate.candidateId)}
              className="w-full md:w-auto shadow-sm"
            >
              View Analysis
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full md:w-auto"
              asChild
            >
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-4 h-4 mr-2" />
                Resume
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
