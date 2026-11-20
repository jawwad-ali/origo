import { type TransferDirection } from "@origo/shared";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const TABS: { direction: TransferDirection; label: string; icon: typeof ArrowDownToLine }[] = [
  { direction: "incoming", label: "Incoming", icon: ArrowDownToLine },
  { direction: "outgoing", label: "Outgoing", icon: ArrowUpFromLine },
];

/** Incoming/outgoing as links, so the choice lives in the URL. */
export const DirectionTabs = ({ active, pending }: { active: TransferDirection; pending: number }) => (
  <nav aria-label="Transfer direction" className="-mb-px flex gap-6 border-b">
    {TABS.map(({ direction, label, icon: Icon }) => {
      const isActive = direction === active;
      return (
        <Link
          key={direction}
          href={`${ROUTES.transfers}?direction=${direction}`}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "focus-visible:text-foreground flex items-center gap-2 border-b-2 pb-3 text-sm outline-none transition-colors",
            isActive
              ? "border-primary text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
          {direction === "incoming" && pending > 0 ? (
            <span className="bg-primary text-primary-foreground tabular rounded-full px-1.5 py-px text-xs">
              {pending}
              <span className="sr-only"> waiting for you</span>
            </span>
          ) : null}
        </Link>
      );
    })}
  </nav>
);
