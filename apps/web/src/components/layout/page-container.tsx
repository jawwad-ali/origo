import { cn } from "@/lib/utils";

export const PageContainer = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8", className)}
    {...props}
  />
);
