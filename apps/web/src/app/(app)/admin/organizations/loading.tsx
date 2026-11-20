import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationsLoading() {
  return (
    <PageContainer aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="space-y-4">
        <div className="flex gap-6 border-b pb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-24" />
          ))}
        </div>
        <div className="bg-card divide-y rounded-lg border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 p-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="hidden h-4 w-24 md:block" />
              <Skeleton className="hidden h-4 w-32 md:block" />
              <Skeleton className="h-8 w-36" />
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
