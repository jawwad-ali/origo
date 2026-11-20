import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="bg-card flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-14 text-center">
    <span className="bg-muted flex size-11 items-center justify-center rounded-full">
      <Icon className="text-muted-foreground size-5" aria-hidden="true" />
    </span>
    <div className="max-w-sm space-y-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
    {action}
  </div>
);
