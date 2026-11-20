import { ORG_TYPE_LABELS, type OrgRefDto } from "@origo/shared";
import { ArrowRight } from "lucide-react";

const Party = ({ label, org }: { label: string; org: OrgRefDto }) => (
  <div className="min-w-0 flex-1 rounded-lg border p-4">
    <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
    <p className="mt-1 truncate font-medium">{org.name}</p>
    <p className="text-muted-foreground text-sm">
      {ORG_TYPE_LABELS[org.type]} · {org.city}, {org.country}
    </p>
  </div>
);

export const TransferParties = ({ from, to }: { from: OrgRefDto; to: OrgRefDto }) => (
  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
    <Party label="From" org={from} />
    <ArrowRight
      className="text-muted-foreground mx-auto size-5 shrink-0 rotate-90 sm:rotate-0"
      aria-hidden="true"
    />
    <Party label="To" org={to} />
  </div>
);
