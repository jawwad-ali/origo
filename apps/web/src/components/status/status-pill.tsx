import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "neutral" | "info";

const TONES: Record<StatusTone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive-soft text-destructive",
  neutral: "bg-muted text-muted-foreground",
  info: "bg-accent text-accent-foreground",
};

interface StatusPillProps {
  tone: StatusTone;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

/** Status is always icon + text, never color alone. */
export const StatusPill = ({ tone, icon: Icon, children, className }: StatusPillProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
      TONES[tone],
      className,
    )}
  >
    <Icon className="size-3.5" aria-hidden="true" />
    {children}
  </span>
);
