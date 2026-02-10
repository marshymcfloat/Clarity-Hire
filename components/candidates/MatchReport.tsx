"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";

// Define the shape of the Match Report data based on Schema/Zod
// Assuming we fetch the full parsed report from DB or API
export interface MatchReportData {
  matchScore: number;
  analysis: {
    skillsMatch: {
      matched: string[];
      missing: string[];
      score: number;
    };
    experienceMatch: {
      score: number;
      summary: string;
      relevantRoles: string[];
    };
    educationMatch: {
      isMet: boolean;
      details: string;
    };
    culturalFit?: {
      score: number;
      analysis: string;
    };
    salaryFit?: {
      analysis: string;
    };
    executiveSummary: string;
  };
  candidateName: string;
  jobTitle: string;
}

interface MatchReportProps {
  data: MatchReportData;
}

export function MatchReport({ data }: MatchReportProps) {
  const { matchScore, analysis, candidateName, jobTitle } = data;

  // Helper for score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-space font-bold">
                {candidateName}
              </CardTitle>
              <CardDescription className="text-base">
                Match Analysis for{" "}
                <span className="font-semibold text-primary">{jobTitle}</span>
              </CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <div
                className={cn(
                  "text-4xl font-bold font-mono",
                  getScoreColor(matchScore),
                )}
              >
                {Math.round(matchScore)}%
              </div>
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                Overall Match
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg border border-border/50 italic text-muted-foreground">
            <Brain className="w-5 h-5 flex-shrink-0 text-primary/70" />
            <p>"{analysis.executiveSummary}"</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Analysis */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              Skills Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Relevance Score</span>
                <span className="font-bold">
                  {analysis.skillsMatch.score}/100
                </span>
              </div>
              <Progress
                value={analysis.skillsMatch.score}
                className="h-2"
                indicatorClassName={getProgressColor(
                  analysis.skillsMatch.score,
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Matched Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skillsMatch.matched.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {analysis.skillsMatch.matched.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No specific skills matched.
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Missing / To Verify
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skillsMatch.missing.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {analysis.skillsMatch.missing.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      All required skills found.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience & Education */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Experience Score</span>
                  <span className="font-bold">
                    {analysis.experienceMatch.score}/100
                  </span>
                </div>
                <Progress
                  value={analysis.experienceMatch.score}
                  className="h-2"
                  indicatorClassName={getProgressColor(
                    analysis.experienceMatch.score,
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {analysis.experienceMatch.summary}
              </p>
              {analysis.experienceMatch.relevantRoles.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Key Roles
                  </h4>
                  <ul className="text-sm list-disc list-inside">
                    {analysis.experienceMatch.relevantRoles.map((role, i) => (
                      <li key={i}>{role}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-500" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Education</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  {analysis.educationMatch.isMet ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  {analysis.educationMatch.details}
                </p>
              </div>
              {analysis.salaryFit && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Salary Expectations
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysis.salaryFit.analysis}
                  </p>
                </div>
              )}
              {analysis.culturalFit && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Cultural Fit
                  </h4>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Progress
                        value={analysis.culturalFit.score}
                        className="h-1.5 w-20"
                      />
                      <span>{analysis.culturalFit.score}/100</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analysis.culturalFit.analysis}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
