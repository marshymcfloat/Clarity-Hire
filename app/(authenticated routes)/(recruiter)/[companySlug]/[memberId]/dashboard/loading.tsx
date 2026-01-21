import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-full">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-8 w-48" />
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
