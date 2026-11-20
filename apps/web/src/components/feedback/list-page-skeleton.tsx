import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

/** Loading state for list pages: header, search box and table rows in their real positions. */
export const ListPageSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <PageContainer aria-busy="true">
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-9 w-32" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-9 w-full sm:w-80" />
      <div className="bg-card divide-y rounded-lg border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 p-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="hidden h-4 w-20 md:block" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  </PageContainer>
);
