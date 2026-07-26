import { LoadingSkeleton } from "@/components/tasks/loading-skeleton";

export default function WhiteboardLoading() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <LoadingSkeleton variant="card" count={1} />
    </div>
  );
}
