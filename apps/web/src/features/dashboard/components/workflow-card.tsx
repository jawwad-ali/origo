import { ORG_TYPE_LABELS, type OrgType } from "@origo/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_WORKFLOWS } from "../constants";

/** The role's workflow on Origo. Steps unlock as each part of the product ships. */
export const WorkflowCard = ({ type }: { type: OrgType }) => (
  <Card className="gap-4">
    <CardHeader>
      <CardTitle className="text-base">How {ORG_TYPE_LABELS[type].toLowerCase()}s use Origo</CardTitle>
      <CardDescription>These tools open up here as they are released.</CardDescription>
    </CardHeader>
    <CardContent>
      <ol className="divide-y rounded-lg border">
        {ROLE_WORKFLOWS[type].map((step, index) => (
          <li key={step.title} className="flex items-start gap-4 p-4">
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
            <span className="text-muted-foreground shrink-0 rounded-full border px-2 py-0.5 text-xs">
              Coming soon
            </span>
          </li>
        ))}
      </ol>
    </CardContent>
  </Card>
);
