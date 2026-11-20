import { ORG_TYPE_LABELS, type OrganizationDto } from "@origo/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { OrgActions } from "./org-actions";

/** Desktop table. Below md the same rows render as cards (OrgCardList). */
export const OrgTable = ({ orgs }: { orgs: OrganizationDto[] }) => (
  <div className="bg-card hidden overflow-hidden rounded-lg border md:block">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-4">Organization</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Registered</TableHead>
          <TableHead className="pr-4 text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orgs.map((org) => (
          <TableRow key={org.id}>
            <TableCell className="max-w-72 pl-4">
              <span className="block truncate font-medium" title={org.name}>
                {org.name}
              </span>
              <span className="text-muted-foreground block font-mono text-xs">{org.licenseNumber}</span>
              {org.rejectionReason ? (
                <span className="text-destructive mt-1 block truncate text-xs" title={org.rejectionReason}>
                  {org.rejectionReason}
                </span>
              ) : null}
            </TableCell>
            <TableCell>{ORG_TYPE_LABELS[org.type]}</TableCell>
            <TableCell className="text-muted-foreground">
              {org.city}, {org.country}
            </TableCell>
            <TableCell className="tabular text-muted-foreground text-right">
              {formatDate(org.createdAt)}
            </TableCell>
            <TableCell className="pr-4">
              <OrgActions org={org} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
