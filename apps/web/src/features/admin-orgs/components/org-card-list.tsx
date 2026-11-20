import { ORG_TYPE_LABELS, type OrganizationDto } from "@origo/shared";
import { formatDate } from "@/lib/format";
import { OrgActions } from "./org-actions";

/** Mobile layout of the organizations list. */
export const OrgCardList = ({ orgs }: { orgs: OrganizationDto[] }) => (
  <ul className="bg-card divide-y rounded-lg border md:hidden">
    {orgs.map((org) => (
      <li key={org.id} className="space-y-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{org.name}</p>
          <p className="text-muted-foreground font-mono text-xs">{org.licenseNumber}</p>
        </div>
        <p className="text-muted-foreground text-sm">
          {ORG_TYPE_LABELS[org.type]} · {org.city}, {org.country} · {formatDate(org.createdAt)}
        </p>
        {org.rejectionReason ? <p className="text-destructive text-sm">{org.rejectionReason}</p> : null}
        <OrgActions org={org} />
      </li>
    ))}
  </ul>
);
