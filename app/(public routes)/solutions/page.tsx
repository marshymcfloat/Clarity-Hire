import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/seo";
import {
  Bot,
  ChartNoAxesColumn,
  ClipboardList,
  FileCheck2,
  MessageSquareText,
  Shield,
  UserCheck,
  Workflow,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Explore ClarityHire capabilities for recruiters, hiring managers, and operations leaders.",
  alternates: {
    canonical: "/solutions",
  },
  openGraph: {
    title: "ClarityHire Solutions",
    description:
      "Explore ClarityHire capabilities for recruiters, hiring managers, and operations leaders.",
    url: absoluteUrl("/solutions"),
  },
};

const solutionAreas = [
  {
    icon: Bot,
    title: "AI-assisted role setup",
    detail:
      "Generate initial job content fast, then refine for your exact role requirements and tone.",
  },
  {
    icon: MessageSquareText,
    title: "Custom screening frameworks",
    detail:
      "Build reusable question libraries and attach role-specific screens to improve signal quality.",
  },
  {
    icon: Workflow,
    title: "Structured recruiting workflow",
    detail:
      "Move from draft to review to publish with clear ownership and status visibility.",
  },
  {
    icon: Shield,
    title: "Moderation and trust controls",
    detail:
      "Use verification and policy gates to reduce risky or low-quality public postings.",
  },
  {
    icon: UserCheck,
    title: "Team collaboration by role",
    detail:
      "Assign Admin, Recruiter, and Hiring Manager responsibilities without losing accountability.",
  },
  {
    icon: ClipboardList,
    title: "Centralized applicant operations",
    detail:
      "Manage applications and candidate states in one place for faster, cleaner decision-making.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Operational visibility",
    detail:
      "Track hiring throughput and process health to spot bottlenecks before they slow recruiting.",
  },
  {
    icon: FileCheck2,
    title: "Audit-ready action history",
    detail:
      "Keep an administrative record of verification, moderation, and entitlement updates.",
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl space-y-4">
          <h1 className="font-space text-4xl font-bold tracking-tight sm:text-5xl">
            Platform capabilities for serious hiring teams
          </h1>
          <p className="text-lg text-slate-600">
            ClarityHire is designed for organizations that need speed, quality,
            and governance in one hiring system.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutionAreas.map((area) => (
            <article
              key={area.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <area.icon className="mb-4 h-5 w-5 text-sky-700" />
              <h2 className="font-space text-lg font-semibold">{area.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {area.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-space text-2xl font-bold tracking-tight">
            Want to map this to your current hiring process?
          </h2>
          <p className="mt-2 text-slate-600">
            We can walk through your workflow and show where ClarityHire
            removes manual overhead and raises decision quality.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/book-demo">
              <Button className="h-11 bg-emerald-600 px-6 text-white hover:bg-emerald-700">
                Book Demo
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="h-11 px-6">
                Compare Plans
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
