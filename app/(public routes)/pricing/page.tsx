import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple recruitment platform plans for teams from startup to enterprise. Choose based on hiring volume and control needs.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "ClarityHire Pricing",
    description:
      "Simple recruitment platform plans for teams from startup to enterprise.",
    url: absoluteUrl("/pricing"),
  },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For small teams validating their first hiring workflow.",
    bestFor: "Up to 1 active published job",
    features: [
      "Company profile and team setup",
      "Job drafts and review workflow",
      "Basic applicant tracking",
      "Standard support",
    ],
  },
  {
    name: "Starter",
    price: "$49",
    description: "For teams hiring monthly with repeatable process needs.",
    bestFor: "Up to 3 active published jobs",
    features: [
      "Everything in Free",
      "Higher active job limits",
      "Advanced custom screening questions",
      "Priority moderation queue",
    ],
  },
  {
    name: "Pro",
    price: "$149",
    description: "For scaling companies that need stronger controls and speed.",
    bestFor: "Up to 20 active published jobs",
    features: [
      "Everything in Starter",
      "Expanded recruiter seat support",
      "Faster support response",
      "Enhanced trust and review controls",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with complex hiring operations.",
    bestFor: "Custom limits and policy controls",
    features: [
      "Everything in Pro",
      "Custom workflows and governance",
      "Dedicated onboarding support",
      "Account-level success planning",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl space-y-4">
          <h1 className="font-space text-4xl font-bold tracking-tight sm:text-5xl">
            Pricing built for real hiring stages
          </h1>
          <p className="text-lg text-slate-600">
            Start small, then scale job capacity and controls as your team
            grows. Billing automation is in progress, while plan activation can
            already be managed by the platform admin.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {plan.name}
                </p>
                <p className="mt-1 font-space text-4xl font-bold text-slate-900">
                  {plan.price}
                  {plan.price !== "Custom" && (
                    <span className="text-base font-medium text-slate-500">
                      /mo
                    </span>
                  )}
                </p>
              </div>

              <p className="text-sm text-slate-700">{plan.description}</p>
              <p className="mt-2 text-sm font-medium text-sky-700">
                Best for: {plan.bestFor}
              </p>

              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-space text-2xl font-bold tracking-tight">
            Need help choosing a plan?
          </h2>
          <p className="mt-2 text-slate-600">
            We can map plan fit using your expected monthly openings, recruiter
            team size, and moderation requirements.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/book-demo">
              <Button className="h-11 bg-slate-900 px-6 text-white hover:bg-slate-800">
                Book Pricing Call
              </Button>
            </Link>
            <Link href="/solutions">
              <Button variant="outline" className="h-11 px-6">
                See Platform Capabilities
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
