import { ORG_TYPE_LABELS, type OrganizationDto } from "@origo/shared";
import { OrgStatusBadge } from "@/components/status/org-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[7rem_1fr] gap-3 py-2.5 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-words">{children}</dd>
  </div>
);

export const OrgDetailsCard = ({ org }: { org: OrganizationDto }) => (
  <Card className="gap-2">
    <CardHeader>
      <CardTitle className="text-base">Organization</CardTitle>
    </CardHeader>
    <CardContent>
      <dl className="divide-y">
        <Row label="Name">{org.name}</Row>
        <Row label="Role">{ORG_TYPE_LABELS[org.type]}</Row>
        <Row label="License">
          <span className="font-mono">{org.licenseNumber}</span>
        </Row>
        <Row label="Location">
          {org.city}, {org.country}
        </Row>
        <Row label="Status">
          <OrgStatusBadge status={org.status} />
        </Row>
        <Row label="Registered">{formatDate(org.createdAt)}</Row>
      </dl>
    </CardContent>
  </Card>
);
