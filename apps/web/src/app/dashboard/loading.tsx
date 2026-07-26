import { LoadingSkeleton } from "@/components/tasks/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <LoadingSkeleton variant="dashboard" />
    </div>
  );
}
