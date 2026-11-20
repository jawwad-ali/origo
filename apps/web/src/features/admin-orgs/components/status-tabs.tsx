import { ORG_STATUS_LABELS, ORG_STATUSES, type OrgStatus } from "@origo/shared";
import Link from "next/link";
import { formatNumber } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { type StatusCounts } from "../types";

/** Status filter as links, so the active tab lives in the URL and works with back/forward. */
export const StatusTabs = ({ active, counts }: { active: OrgStatus; counts: StatusCounts }) => (
  <nav aria-label="Filter by status" className="-mb-px flex gap-6 overflow-x-auto border-b">
    {ORG_STATUSES.map((status) => {
      const isActive = status === active;
      return (
        <Link
          key={status}
          href={`${ROUTES.adminOrganizations}?status=${status}`}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "focus-visible:text-foreground flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm outline-none transition-colors",
            isActive
              ? "border-primary text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent",
          )}
        >
          {ORG_STATUS_LABELS[status]}
          <span
            className={cn(
              "tabular rounded-full px-1.5 py-px text-xs",
              isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {formatNumber(counts[status])}
          </span>
        </Link>
      );
    })}
  </nav>
);
