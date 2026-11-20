import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  isPending: boolean;
  label: string;
  pendingLabel: string;
  className?: string;
}

export const SubmitButton = ({ isPending, label, pendingLabel, className }: SubmitButtonProps) => (
  <Button type="submit" disabled={isPending} aria-busy={isPending} className={cn("w-full", className)}>
    {isPending ? (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {pendingLabel}
      </>
    ) : (
      label
    )}
  </Button>
);
