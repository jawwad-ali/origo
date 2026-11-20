"use client";

import { type OrganizationDto } from "@origo/shared";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACTIONS_BY_STATUS } from "../constants";
import { useReviewAction } from "../hooks/use-review-action";
import { approveOrganization } from "../services/admin-orgs.client";
import { RejectDialog } from "./reject-dialog";
import { SuspendDialog } from "./suspend-dialog";

export const OrgActions = ({ org }: { org: OrganizationDto }) => {
  const actions = ACTIONS_BY_STATUS[org.status];
  const { isPending, run } = useReviewAction();

  return (
    <div className="flex items-center justify-end gap-2">
      {actions.includes("reject") ? <RejectDialog org={org} /> : null}
      {actions.includes("suspend") ? <SuspendDialog org={org} /> : null}
      {actions.includes("approve") ? (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => run(() => approveOrganization(org.id), "Organization approved")}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {org.status === "SUSPENDED" ? "Reinstate" : "Approve"}
        </Button>
      ) : null}
    </div>
  );
};
