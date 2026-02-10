"use client";

import CreateCompanyDialog from "@/components/CompanyAuth/CreateCompanyDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/solutions", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust & Security" },
  { href: "/book-demo", label: "Book Demo" },
];

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="font-space text-lg font-bold tracking-tight text-slate-900">
            ClarityHire
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/companies">
            <Button
              variant="ghost"
              className="h-10 px-4 text-slate-700 hover:text-slate-900"
            >
              Browse Jobs
            </Button>
          </Link>
          <CreateCompanyDialog
            trigger={
              <Button className="h-10 bg-emerald-600 px-4 text-white hover:bg-emerald-700">
                Start Hiring
              </Button>
            }
          />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-slate-700 md:hidden"
          aria-expanded={open}
          aria-controls="marketing-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="marketing-mobile-menu"
        className={cn(
          "overflow-hidden border-t border-slate-200 bg-white transition-[max-height] duration-300 md:hidden",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <div className="space-y-2 px-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/companies"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Browse Jobs
          </Link>
          <CreateCompanyDialog
            trigger={
              <Button className="mt-2 h-11 w-full bg-emerald-600 text-white hover:bg-emerald-700">
                Start Hiring
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
}
