import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card className="col-span-3 h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest applications and system updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] pr-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity.
              </p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={activity.candidateAvatar}
                      alt={activity.candidateName}
                    />
                    <AvatarFallback>
                      {activity.candidateName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.candidateName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Applied for{" "}
                      <span className="font-medium text-foreground">
                        {activity.jobTitle}
                      </span>
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {new Intl.RelativeTimeFormat("en", {
                      numeric: "auto",
                    }).format(
                      -Math.round(
                        (Date.now() - new Date(activity.timestamp).getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                      "day",
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
