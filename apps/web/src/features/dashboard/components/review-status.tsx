import { type OrganizationDto } from "@origo/shared";
import { Ban, Check, CircleX, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const COPY = {
  PENDING: {
    icon: Clock,
    tone: "bg-warning-soft text-warning",
    title: "Your organization is under review",
    body: "An Origo admin is checking your drug license. You'll be able to record products and transfers once it's approved.",
  },
  REJECTED: {
    icon: CircleX,
    tone: "bg-destructive-soft text-destructive",
    title: "Your registration wasn't approved",
    body: "Read the reason below. If the details were wrong, contact the Origo team to have it reviewed again.",
  },
  SUSPENDED: {
    icon: Ban,
    tone: "bg-muted text-muted-foreground",
    title: "Your organization is suspended",
    body: "You can sign in, but you can't record anything until the Origo team lifts the suspension.",
  },
} as const;

type ReviewState = keyof typeof COPY;

export const ReviewStatus = ({ org }: { org: OrganizationDto & { status: ReviewState } }) => {
  const copy = COPY[org.status];
  const Icon = copy.icon;

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", copy.tone)}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{copy.title}</h2>
            <p className="text-muted-foreground max-w-prose text-sm">{copy.body}</p>
          </div>
        </div>

        {org.status === "PENDING" ? (
          <ol className="grid gap-3 sm:grid-cols-3" aria-label="Review progress">
            <li className="flex items-center gap-2 text-sm">
              <Check className="text-success size-4" aria-hidden="true" />
              Submitted {formatDate(org.createdAt)}
            </li>
            <li className="flex items-center gap-2 text-sm font-medium" aria-current="step">
              <span className="bg-warning size-2 rounded-full" aria-hidden="true" />
              License check
            </li>
            <li className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="border-muted-foreground size-2 rounded-full border" aria-hidden="true" />
              Approved
            </li>
          </ol>
        ) : null}

        {org.status === "REJECTED" && org.rejectionReason ? (
          <blockquote className="border-destructive bg-destructive-soft/50 rounded-md border-l-2 px-4 py-3 text-sm">
            <span className="text-muted-foreground block text-xs font-medium">Reason from the reviewer</span>
            {org.rejectionReason}
          </blockquote>
        ) : null}
      </CardContent>
    </Card>
  );
};
