import { ORG_STATUS_LABELS, ORG_STATUSES } from "@origo/shared";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { OrgStatusBadge } from "@/components/status/org-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStatusCounts } from "@/features/admin-orgs/services/admin-orgs.server";
import { formatNumber } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

export const AdminOverview = async () => {
  const counts = await getStatusCounts();

  return (
    <div className="space-y-6">
      {counts.PENDING > 0 ? (
        <Card className="border-warning/40 bg-warning-soft/40">
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                {formatNumber(counts.PENDING)}{" "}
                {counts.PENDING === 1 ? "organization is" : "organizations are"} waiting for review
              </p>
              <p className="text-muted-foreground text-sm">Check each license before approving.</p>
            </div>
            <Button asChild>
              <Link href={`${ROUTES.adminOrganizations}?status=PENDING`}>
                Review queue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <dl className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-xl border lg:grid-cols-4">
        {ORG_STATUSES.map((status) => (
          <Link
            key={status}
            href={`${ROUTES.adminOrganizations}?status=${status}`}
            className="bg-card hover:bg-muted/50 focus-visible:ring-ring group p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset"
          >
            <dt className="text-muted-foreground text-sm">{ORG_STATUS_LABELS[status]}</dt>
            <dd className="mt-2 flex items-center justify-between gap-2">
              <span className="tabular text-2xl font-semibold">{formatNumber(counts[status])}</span>
              <OrgStatusBadge
                status={status}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              />
            </dd>
          </Link>
        ))}
      </dl>
    </div>
  );
};
