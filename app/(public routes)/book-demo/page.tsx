import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/seo";
import { CalendarClock, Mail, PhoneCall } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book Demo",
  description:
    "Book a ClarityHire walkthrough and see how your team can improve recruiting throughput and trust.",
  alternates: {
    canonical: "/book-demo",
  },
  openGraph: {
    title: "Book a ClarityHire Demo",
    description:
      "Get a live walkthrough tailored to your current hiring process.",
    url: absoluteUrl("/book-demo"),
  },
};

export default function BookDemoPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <MarketingHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
            <CalendarClock className="h-3.5 w-3.5" />
            Live walkthrough
          </p>

          <h1 className="font-space text-4xl font-bold tracking-tight sm:text-5xl">
            Book a ClarityHire demo
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            We will review your recruiting process, map bottlenecks, and show
            how to implement a trust-first, faster hiring workflow with
            ClarityHire.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-space text-xl font-semibold">
                What we will cover
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Current hiring funnel and friction points
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Workflow design using your team structure
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Plan and rollout recommendation
                </li>
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-space text-xl font-semibold">
                Contact options
              </h2>
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  sales@clarityhire.online
                </p>
                <p className="inline-flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-slate-500" />
                  +1 (555) 014-7821
                </p>
              </div>
            </article>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="mailto:sales@clarityhire.online?subject=ClarityHire%20Demo%20Request">
              <Button className="h-11 bg-emerald-600 px-6 text-white hover:bg-emerald-700">
                Request By Email
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="h-11 px-6">
                Review Pricing First
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
