import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";

interface Activity {
  id: string;
  type: "APPLICATION" | "HIRE" | "INTERVIEW";
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  timestamp: Date;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

export default function RecentActivityFeed({
  activities,
}: RecentActivityFeedProps) {
  return (
    <Card className="md:col-span-1 lg:col-span-3 h-full  border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col max-h-[400px] ">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="font-space text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Recent Activity
              <Badge variant="secondary" className="font-mono text-[10px] h-5">
                LIVE
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Latest applications and system updates.
            </CardDescription>
          </div>
          <Bell className="h-4 w-4 text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-fit  w-full">
          <div className="p-6 space-y-6">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-slate-100 p-3 mb-4">
                  <Bell className="h-6 w-6 text-slate-400" />
                </div>
                <p className="font-medium">No recent activity</p>
                <p className="text-sm">New actions will appear here.</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group flex items-start gap-4 relative"
                >
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[18px] top-10 bottom-[-24px] w-px bg-slate-100 dark:bg-slate-800 group-last:hidden" />
                  )}

                  <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-950 shadow-sm z-10 shrink-0">
                    <AvatarImage
                      src={activity.candidateAvatar}
                      alt={activity.candidateName}
                    />
                    <AvatarFallback className="bg-violet-100 text-violet-700 font-bold text-xs">
                      {activity.candidateName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                      {activity.candidateName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Applied for{" "}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {activity.jobTitle}
                      </span>
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 pt-1">
                      {new Intl.RelativeTimeFormat("en", {
                        numeric: "auto",
                      }).format(
                        -Math.round(
                          (Date.now() -
                            new Date(activity.timestamp).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ),
                        "day",
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
