"use client";

import {
  Briefcase,
  ClipboardList,
  Bookmark,
  Users,
  Loader2,
} from "lucide-react";
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
  const { data: session, status } = useSession();

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
    {
      title: "Saved Jobs",
      url: `/${companySlug}/saved-jobs`,
      icon: Bookmark,
    },
  ];

  const RecruiterItems = [
    {
      title: "Dashboard",
      url: `/${companySlug}/${session?.user?.memberId}/dashboard`,
      icon: Briefcase,
    },
    {
      title: "Manage Jobs",
      url: `/${companySlug}/${session?.user?.memberId}/manage-jobs`,
      icon: Briefcase,
    },
    {
      title: "Manage Applicants",
      url: `/${companySlug}/${session?.user?.memberId}/manage-applicants`,
      icon: Users,
    },
  ];

  const getSidebarItems = () => {
    if (
      status === "loading" ||
      status === "unauthenticated" ||
      !session?.user
    ) {
      return [];
    }

    if (session.user.isRecruiter) {
      return RecruiterItems;
    }

    if (!session.user.isRecruiter) {
      return ApplicantItems;
    }

    return [];
  };

  const items = getSidebarItems();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {status === "loading" ? (
                <div className="flex w-full justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                items.map((item) => {
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
              )}
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
