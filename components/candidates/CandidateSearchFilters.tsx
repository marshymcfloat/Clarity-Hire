"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Briefcase, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SearchFilters {
  query: string;
  location: string;
  minExperience: number;
  skills: string; // comma separated
  onlyApplicants: boolean;
  jobId?: string;
}

interface CandidateSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  jobs: { id: string; title: string }[];
}

export function CandidateSearchFilters({
  onFiltersChange,
  initialFilters,
  jobs,
}: CandidateSearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    minExperience: 0,
    skills: "",
    onlyApplicants: false,
    jobId: undefined,
    ...initialFilters,
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);

  useEffect(() => {
    onFiltersChange(debouncedFilters);
  }, [debouncedFilters, onFiltersChange]);

  const handleChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="h-fit sticky top-4 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-space">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Context */}
        <div className="space-y-2">
          <Label>Target Job (Optional)</Label>
          <Select
            value={filters.jobId || "all"}
            onValueChange={(val) =>
              handleChange("jobId", val === "all" ? undefined : val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a job..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select a job to enable detailed match reports.
          </p>
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label>Keywords</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Software Engineer, React..."
              className="pl-9"
              value={filters.query}
              onChange={(e) => handleChange("query", e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="New York, Remote..."
              className="pl-9"
              value={filters.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Skills (comma separated)</Label>
          <div className="relative">
            <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Typescript, Node.js..."
              className="pl-9"
              value={filters.skills}
              onChange={(e) => handleChange("skills", e.target.value)}
            />
          </div>
        </div>

        {/* Min Experience */}
        <div className="space-y-2">
          <Label>Min Experience (Years)</Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={filters.minExperience || ""}
            onChange={(e) =>
              handleChange("minExperience", parseInt(e.target.value) || 0)
            }
          />
        </div>

        {/* Only Applicants Switch */}
        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg bg-muted/20">
          <Label htmlFor="applicants-mode" className="cursor-pointer">
            Only Applicants
          </Label>
          <Switch
            id="applicants-mode"
            checked={filters.onlyApplicants}
            onCheckedChange={(checked) =>
              handleChange("onlyApplicants", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
