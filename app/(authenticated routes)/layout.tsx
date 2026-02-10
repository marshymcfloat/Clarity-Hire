import { AppSidebar } from "@/components/App Sidebar/AppSidebar";
import { MainContent } from "@/components/MainContent";
import NextSessionProvider from "@/components/providers/NextSessionProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

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
