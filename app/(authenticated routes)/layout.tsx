import { AppSidebar } from "@/components/App Sidebar/AppSidebar";
import { MainContent } from "@/components/MainContent";
import NextSessionProvider from "@/components/providers/NextSessionProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const CompanyLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex w-screen h-screen">
        <AppSidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
};

export default CompanyLayout;
