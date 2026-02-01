import CreateCompanyDialog from "@/components/CompanyAuth/CreateCompanyDialog";
import ProgressLink from "@/components/ui/ProgressLink";
import { ArrowRight, CheckCircle2, Rocket } from "lucide-react";

const page = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-50 blur-[100px] rounded-full mix-blend-multiply will-change-transform transform-gpu" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 blur-[100px] rounded-full mix-blend-multiply will-change-transform transform-gpu" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-purple-50 blur-[80px] rounded-full mix-blend-multiply opacity-70 will-change-transform transform-gpu" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="max-w-5xl">
          <div className="animate-fade-in space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-xs font-mono text-slate-500 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              v2.0 Now Live
            </div>

            <h1 className="font-space font-bold text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-[0.9] text-slate-900">
              Clarity
              <span className="text-slate-400">Hire.</span>
            </h1>

            <p className="max-w-xl text-lg md:text-2xl text-slate-600 font-light leading-relaxed">
              No more uncertainties. We bridge the gap between talent and
              opportunity with
              <span className="text-indigo-600 font-medium">
                {" "}
                precision
              </span>{" "}
              and
              <span className="text-indigo-600 font-medium"> transparency</span>
              .
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-8 items-start sm:items-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <CreateCompanyDialog
                  trigger={
                    <button className="relative flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg font-semibold tracking-wide hover:bg-slate-800 transition-all duration-300 shadow-xl shadow-indigo-500/10">
                      <Rocket className="w-5 h-5 text-indigo-400" />
                      Launch Your Company
                    </button>
                  }
                />
              </div>

              <ProgressLink
                href="/companies"
                className="group flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white/50 hover:bg-white transition-all duration-300 text-slate-600 font-medium shadow-sm hover:shadow-md"
              >
                Browse Companies
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </ProgressLink>
            </div>

            <div className="pt-16 flex flex-wrap gap-x-12 gap-y-4 text-sm text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Transparent Salaries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Direct HR Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;
