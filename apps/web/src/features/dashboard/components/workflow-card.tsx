import { ORG_TYPE_LABELS, type OrgType } from "@origo/shared";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_WORKFLOWS, type WorkflowStep } from "../constants";

const StepBody = ({ step, index }: { step: WorkflowStep; index: number }) => (
  <>
    <span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
      <step.icon className="size-4" aria-hidden="true" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-x-2 text-sm font-medium">
        <span className="tabular text-muted-foreground">{index + 1}.</span>
        {step.title}
      </span>
      <span className="text-muted-foreground mt-0.5 block text-sm">{step.description}</span>
    </span>
  </>
);

/** The role's workflow on Origo. Shipped steps link to their pages; the rest are marked as coming. */
export const WorkflowCard = ({ type }: { type: OrgType }) => {
  const steps = ROLE_WORKFLOWS[type];
  const anyLive = steps.some((step) => step.href);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base">How {ORG_TYPE_LABELS[type].toLowerCase()}s use Origo</CardTitle>
        <CardDescription>
          {anyLive ? "Start with the first step." : "These tools open up here as they are released."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="divide-y rounded-lg border">
          {steps.map((step, index) => (
            <li key={step.title}>
              {step.href ? (
                <Link
                  href={step.href}
                  className="hover:bg-muted/50 focus-visible:ring-ring group flex items-start gap-4 p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset"
                >
                  <StepBody step={step} index={index} />
                  <ArrowRight
                    className="text-muted-foreground group-hover:text-foreground mt-2 size-4 shrink-0 transition-colors"
                    aria-hidden="true"
                  />
                </Link>
              ) : (
                <div className="flex items-start gap-4 p-4">
                  <StepBody step={step} index={index} />
                  <span className="text-muted-foreground shrink-0 rounded-full border px-2 py-0.5 text-xs">
                    Coming soon
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
