import { ORG_STATUS_LABELS, type OrgStatus } from "@origo/shared";
import { Ban, CircleCheck, Clock, CircleX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<OrgStatus, { icon: LucideIcon; className: string }> = {
  APPROVED: { icon: CircleCheck, className: "bg-success-soft text-success" },
  PENDING: { icon: Clock, className: "bg-warning-soft text-warning" },
  REJECTED: { icon: CircleX, className: "bg-destructive-soft text-destructive" },
  SUSPENDED: { icon: Ban, className: "bg-muted text-muted-foreground" },
};

export const OrgStatusBadge = ({ status, className }: { status: OrgStatus; className?: string }) => {
  const { icon: Icon, className: tone } = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {ORG_STATUS_LABELS[status]}
    </span>
  );
};
