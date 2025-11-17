import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StatCardSkeleton = () => {
  return (
    <Card className="max-w-[400px]">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-12" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
};

export default StatCardSkeleton;
