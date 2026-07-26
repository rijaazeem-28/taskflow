import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type LoadingSkeletonProps = {
  variant?: "card" | "list" | "grid" | "dashboard" | "charts" | "activity" | "kanban" | "calendar";
  count?: number;
  className?: string;
};

function TaskCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-3/4 rounded-lg" />
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-2/3 rounded-lg" />
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-lg" />
      </CardContent>
    </Card>
  );
}

function TaskListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      <Skeleton className="h-5 w-5 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-3 w-1/3 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2 p-5 pb-2">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-56 rounded-lg" />
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <Skeleton className="h-[220px] w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}

export function LoadingSkeleton({ variant = "list", count = 3, className }: LoadingSkeletonProps) {
  if (variant === "dashboard") {
    return (
      <div className={cn("space-y-5", className)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-5">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (variant === "charts") {
    return (
      <div className={cn("grid grid-cols-1 gap-5 xl:grid-cols-2", className)}>
        {Array.from({ length: count || 4 }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === "activity") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-3 w-2/3 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "kanban") {
    return (
      <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5", className)}>
        {Array.from({ length: 5 }).map((_, col) => (
          <div key={col} className="space-y-3 rounded-2xl bg-slate-100/70 p-3">
            <Skeleton className="h-5 w-24 rounded-lg" />
            {Array.from({ length: 2 }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "calendar") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <TaskListRowSkeleton key={i} />
      ))}
    </div>
  );
}
