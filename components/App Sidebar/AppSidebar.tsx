"use client";

import {
  Briefcase,
  ClipboardList,
  Bookmark,
  Users,
  Loader2,
  LayoutDashboard,
  Building2,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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
import { useEffect, useState } from "react";

export function AppSidebar() {
  const { companySlug } = useParams();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Securely define items based on role
  const getSidebarItems = () => {
    if (status !== "authenticated" || !session?.user) return null;

    if (session.user.isRecruiter) {
      return [
        {
          label: "Management",
          items: [
            {
              title: "Dashboard",
              url: `/${companySlug}/${session.user.memberId}/dashboard`,
              icon: LayoutDashboard,
            },
            {
              title: "Manage Jobs",
              url: `/${companySlug}/${session.user.memberId}/manage-jobs`,
              icon: Briefcase,
            },
            {
              title: "Manage Applicants",
              url: `/${companySlug}/${session.user.memberId}/manage-applicants`,
              icon: Users,
            },
          ],
        },
      ];
    }

    return [
      {
        label: "Candidate",
        items: [
          {
            title: "Available Jobs",
            url: `/${companySlug}/available-jobs`,
            icon: Briefcase,
          },
          {
            title: "My Applications",
            url: `/${companySlug}/job-applications`,
            icon: ClipboardList,
          },
          {
            title: "Saved Jobs",
            url: `/${companySlug}/saved-jobs`,
            icon: Bookmark,
          },
        ],
      },
    ];
  };

  const itemGroups = getSidebarItems();
  const isLoading = status === "loading" || !mounted;

  return (
    <Sidebar className="border-r border-slate-100 bg-white/80 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-slate-50">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-space font-bold text-sm text-slate-900 tracking-tight">
              ClarityHire
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Career Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {isLoading ? (
          <div className="flex w-full justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : !itemGroups ? (
          <div className="px-4 py-4 text-center">
            <p className="text-sm text-slate-500">
              Please sign in to access the menu.
            </p>
          </div>
        ) : (
          itemGroups.map((group, idx) => (
            <SidebarGroup key={group.label} className={cn(idx > 0 && "mt-6")}>
              <SidebarGroupLabel className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-out",
                            isActive
                              ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          )}
                        >
                          <ProgressLink href={item.url}>
                            <item.icon
                              className={cn(
                                "h-4 w-4 transition-colors",
                                isActive
                                  ? "text-indigo-600"
                                  : "text-slate-400 group-hover:text-slate-600",
                              )}
                            />
                            <span className="font-medium">{item.title}</span>
                            {isActive && (
                              <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
                            )}
                          </ProgressLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-50 p-4">
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
