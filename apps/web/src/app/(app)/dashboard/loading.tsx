import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <PageContainer aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="bg-card space-y-3 rounded-xl border p-6">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-72" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="bg-card space-y-3 rounded-xl border p-6">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
