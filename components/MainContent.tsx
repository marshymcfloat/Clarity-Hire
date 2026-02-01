"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export const MainContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="relative flex-1 h-full overflow-y-auto bg-white/50">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-50 blur-[100px] rounded-full mix-blend-multiply will-change-transform transform-gpu" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 blur-[100px] rounded-full mix-blend-multiply will-change-transform transform-gpu" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015]"></div>
      </div>

      <div className="relative z-10 p-4 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <SidebarTrigger className="h-10 w-10 text-slate-500 hover:text-slate-900 transition-colors" />
        </div>

        <div className="animate-fade-in">{children}</div>
      </div>
      <Toaster />
    </main>
  );
};
