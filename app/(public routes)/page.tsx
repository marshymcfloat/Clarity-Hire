import CreateCompanyDialog from "@/components/CompanyAuth/CreateCompanyDialog";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/seo";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Building2,
  Clock4,
  FileSearch,
  HandCoins,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ClarityHire | Convert Hiring Chaos Into Predictable Growth",
  description:
    "Attract stronger candidates, review faster, and hire with confidence through AI-assisted workflows and trust-first employer verification.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ClarityHire | Convert Hiring Chaos Into Predictable Growth",
    description:
      "AI-assisted recruitment workflows, better screening, and trust-first hiring controls for growing companies.",
    url: absoluteUrl("/"),
  },
  twitter: {
    title: "ClarityHire | Convert Hiring Chaos Into Predictable Growth",
    description:
      "AI-assisted recruitment workflows, better screening, and trust-first hiring controls for growing companies.",
  },
};

const coreOffers = [
  {
    icon: BrainCircuit,
    title: "AI-assisted job creation",
    description:
      "Generate role summaries, responsibilities, and qualifications in minutes, then edit to match your hiring standards.",
  },
  {
    icon: FileSearch,
    title: "Structured candidate screening",
    description:
      "Attach custom question sets per role and move from generic applications to signal-rich candidate data.",
  },
  {
    icon: ShieldCheck,
    title: "Trust-first hiring controls",
    description:
      "Company verification, job moderation, and policy-based publishing reduce spam and protect candidate trust.",
  },
  {
    icon: Users2,
    title: "Team-based recruiting",
    description:
      "Collaborate with Admin, Recruiter, and Hiring Manager roles so hiring ownership is clear and auditable.",
  },
  {
    icon: Clock4,
    title: "Faster decision cycles",
    description:
      "Consolidate job creation, application review, and status updates in one workspace to shorten time-to-hire.",
  },
  {
    icon: HandCoins,
    title: "Pricing that scales with growth",
    description:
      "Start lean, then expand active job limits and access controls as your hiring volume increases.",
  },
];

const faq = [
  {
    q: "Can we start before billing is fully automated?",
    a: "Yes. You can launch your company and run pilot hiring workflows now. Plan activation and entitlements can be managed from admin operations while billing automation is finalized.",
  },
  {
    q: "Is ClarityHire only for tech teams?",
    a: "No. The workflow supports multiple departments and role types. Tech, operations, customer success, and business teams can all recruit from the same system.",
  },
  {
    q: "What makes this different from a basic job board?",
    a: "ClarityHire combines posting, screening, moderation, and team workflows in one system, so you can control quality and process, not just list jobs.",
  },
];

const pricingPreview = [
  {
    name: "Free",
    price: "$0",
    subtitle: "For early teams testing workflow",
    points: [
      "Basic hiring workspace",
      "Limited active published jobs",
      "Standard support",
    ],
  },
  {
    name: "Starter",
    price: "$49",
    subtitle: "For teams hiring every month",
    points: [
      "Higher job limits",
      "Advanced question workflows",
      "Team collaboration features",
    ],
  },
  {
    name: "Pro",
    price: "$149",
    subtitle: "For scaling companies",
    points: [
      "Larger hiring capacity",
      "Priority support and controls",
      "Enhanced trust and moderation tooling",
    ],
  },
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ClarityHire",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "ClarityHire is an AI-assisted hiring platform for companies to create jobs, screen candidates, and manage recruiting workflows.",
    url: absoluteUrl("/"),
    offers: pricingPreview.map((plan) => ({
      "@type": "Offer",
      priceCurrency: "USD",
      price: plan.price.replace("$", ""),
      name: `${plan.name} Plan`,
    })),
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <MarketingHeader />

      <main>
        <section className="relative overflow-hidden border-b border-slate-200">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-sky-200/45 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
            <div className="space-y-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                Built for serious hiring teams
              </p>

              <h1 className="font-space text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Hire faster with better signal, less noise, and stronger trust.
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                ClarityHire helps companies move from fragmented recruiting
                tools to one operational hiring system with AI-assisted job
                creation, structured screening, and moderation controls.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <CreateCompanyDialog
                  trigger={
                    <Button className="h-11 bg-emerald-600 px-6 text-white hover:bg-emerald-700">
                      Start Hiring Now
                    </Button>
                  }
                />
                <Link href="/book-demo">
                  <Button
                    variant="outline"
                    className="h-11 border-slate-300 px-6 text-slate-800"
                  >
                    Book a Live Demo
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Verification-first publishing
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                  AI-assisted workflows
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
              <p className="mb-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
                What leaders care about
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-slate-900">Faster</p>
                  <p className="text-sm text-slate-600">
                    Role-to-review cycle with unified job and screening flows.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-slate-900">Cleaner</p>
                  <p className="text-sm text-slate-600">
                    Higher quality candidate data through structured questions.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-slate-900">Safer</p>
                  <p className="text-sm text-slate-600">
                    Moderation and publish policy checks before jobs go live.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-slate-900">
                    Aligned
                  </p>
                  <p className="text-sm text-slate-600">
                    Team roles and audit trails for operational accountability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-space text-3xl font-bold tracking-tight text-slate-900">
              What ClarityHire offers
            </h2>
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800"
            >
              Explore all solutions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coreOffers.map((offer) => (
              <article
                key={offer.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <offer.icon className="mb-4 h-5 w-5 text-sky-700" />
                <h3 className="mb-2 font-space text-lg font-semibold text-slate-900">
                  {offer.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {offer.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-8 space-y-3">
              <h2 className="font-space text-3xl font-bold tracking-tight text-slate-900">
                Straightforward pricing for growing teams
              </h2>
              <p className="max-w-3xl text-slate-600">
                Plans are visible now so teams can evaluate fit early. Billing
                automation is being finalized; activation can be managed during
                onboarding in the meantime.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {pricingPreview.map((plan) => (
                <article
                  key={plan.name}
                  className="rounded-2xl border border-slate-200 p-6"
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {plan.name}
                  </p>
                  <p className="mt-2 font-space text-4xl font-bold text-slate-900">
                    {plan.price}
                    <span className="text-base font-medium text-slate-500">
                      /mo
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{plan.subtitle}</p>
                  <ul className="mt-5 space-y-2 text-sm text-slate-700">
                    {plan.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/pricing">
                <Button className="h-11 bg-slate-900 px-6 text-white hover:bg-slate-800">
                  View Full Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-3">
            <h2 className="font-space text-3xl font-bold tracking-tight text-slate-900">
              Questions companies ask before switching
            </h2>
            <p className="text-slate-600">
              If your team is evaluating a hiring platform this quarter, these
              are the common decision questions.
            </p>
          </div>
          <div className="space-y-4">
            {faq.map((item) => (
              <article
                key={item.q}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <h3 className="font-semibold text-slate-900">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100">
                  <Building2 className="h-3.5 w-3.5" />
                  For teams hiring now
                </p>
                <h2 className="font-space text-3xl font-bold tracking-tight">
                  Ready to launch your recruiting workflow this week?
                </h2>
                <p className="max-w-2xl text-slate-200">
                  Start free, set up your company profile, and move your first
                  role into review today.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <CreateCompanyDialog
                  trigger={
                    <Button className="h-11 bg-emerald-500 px-6 text-slate-950 hover:bg-emerald-400">
                      Launch Company
                    </Button>
                  }
                />
                <Link href="/book-demo">
                  <Button
                    variant="outline"
                    className="h-11 border-white/30 bg-transparent px-6 text-white hover:bg-white/10"
                  >
                    Talk To Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
