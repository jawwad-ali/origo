import { cn } from "@/lib/utils";

interface OrigoMarkProps {
  className?: string;
  withWordmark?: boolean;
}

/** The Origo mark: a ring (the supply chain) with one point of origin. */
export const OrigoMark = ({ className, withWordmark = true }: OrigoMarkProps) => (
  <span className={cn("text-foreground inline-flex items-center gap-2", className)}>
    <svg viewBox="0 0 24 24" className="text-primary size-6" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="12" cy="3.75" r="2.75" fill="currentColor" />
    </svg>
    {withWordmark ? <span className="text-[15px] font-semibold tracking-tight">Origo</span> : null}
  </span>
);
