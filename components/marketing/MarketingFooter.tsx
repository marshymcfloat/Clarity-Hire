import Link from "next/link";

const footerNav = [
  { href: "/solutions", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/trust", label: "Trust & Security" },
  { href: "/book-demo", label: "Book Demo" },
  { href: "/companies", label: "Jobs Directory" },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-3">
          <p className="font-space text-xl font-bold tracking-tight text-slate-900">
            ClarityHire
          </p>
          <p className="max-w-md text-sm text-slate-600">
            Hiring OS for modern companies: structured recruiting workflows,
            stronger trust controls, and faster hiring decisions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
