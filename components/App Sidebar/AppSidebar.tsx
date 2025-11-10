"use client";

import { Briefcase, ClipboardList } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import UserButton from "./UserButton";
import { useSession } from "next-auth/react";
import ProgressLink from "../ui/ProgressLink";

export function AppSidebar() {
  const { companySlug } = useParams();
  const pathname = usePathname();
  const session = useSession();

  const ApplicantItems = [
    {
      title: "Available jobs",
      url: `/${companySlug}/available-jobs`,
      icon: Briefcase,
    },
    {
      title: "Job Applications",
      url: `/${companySlug}/job-applications`,
      icon: ClipboardList,
    },
  ];

  const RecruiterItems = [
    {
      title: "Dashboard",
      url: `/${companySlug}/${session.data?.user.memberId}/dashboard`,
      icon: Briefcase,
    },
    {
      title: "Manage Jobs",
      url: `/${companySlug}/${session.data?.user.memberId}/manage-jobs`,
      icon: Briefcase,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {!session.data?.user.isRecruiter
                ? ApplicantItems.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={cn(isActive && "font-semibold")}
                        >
                          <ProgressLink href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </ProgressLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                : RecruiterItems.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={cn(isActive && "font-semibold")}
                        >
                          <ProgressLink href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </ProgressLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
