import { AppSidebar } from "@/components/App Sidebar/AppSidebar";
import { MainContent } from "@/components/MainContent";
import NextSessionProvider from "@/components/providers/NextSessionProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const CompanyLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextSessionProvider>
      <SidebarProvider>
        <div className="flex w-full h-screen overflow-hidden bg-white">
          <AppSidebar />
          <MainContent>{children}</MainContent>
        </div>
      </SidebarProvider>
    </NextSessionProvider>
  );
};

export default CompanyLayout;
