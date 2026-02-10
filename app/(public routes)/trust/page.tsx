import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/seo";
import {
  Activity,
  FileLock2,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust & Security",
  description:
    "Learn how ClarityHire uses verification, moderation, and audit controls to protect platform quality.",
  alternates: {
    canonical: "/trust",
  },
  openGraph: {
    title: "ClarityHire Trust & Security",
    description:
      "Verification, moderation, and audit controls designed for safer hiring operations.",
    url: absoluteUrl("/trust"),
  },
};

const controls = [
  {
    icon: UserRoundCheck,
    title: "Company verification workflow",
    detail:
      "Employer organizations are reviewed and managed through explicit verification states.",
  },
  {
    icon: ShieldCheck,
    title: "Policy-based publishing",
    detail:
      "Jobs are evaluated against verification and entitlement policies before publication.",
  },
  {
    icon: Activity,
    title: "Administrative moderation",
    detail:
      "Platform admins can approve, reject, suspend, and review with traceable outcomes.",
  },
  {
    icon: FileLock2,
    title: "Audit event logging",
    detail:
      "Critical trust and moderation actions are recorded for accountability and investigations.",
  },
  {
    icon: LockKeyhole,
    title: "Role-based access boundaries",
    detail:
      "Tenant-level recruiter roles and platform-level admin roles are separated for safer operations.",
  },
];

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl space-y-4">
          <h1 className="font-space text-4xl font-bold tracking-tight sm:text-5xl">
            Trust and security are product features, not afterthoughts
          </h1>
          <p className="text-lg text-slate-600">
            ClarityHire prioritizes platform quality through verification-first
            employer workflows, moderation controls, and policy-based publishing
            decisions.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {controls.map((control) => (
            <article
              key={control.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <control.icon className="mb-4 h-5 w-5 text-emerald-700" />
              <h2 className="font-space text-lg font-semibold">
                {control.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {control.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-space text-2xl font-bold tracking-tight">
            Need a trust and compliance walkthrough for your team?
          </h2>
          <p className="mt-2 text-slate-600">
            We can review your hiring risk profile and map how verification,
            moderation, and entitlement controls should be configured.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/book-demo">
              <Button className="h-11 bg-slate-900 px-6 text-white hover:bg-slate-800">
                Schedule Review
              </Button>
            </Link>
            <Link href="/solutions">
              <Button variant="outline" className="h-11 px-6">
                Explore Platform
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
