import { ORG_TYPE_LABELS } from "@origo/shared";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { AdminOverview } from "@/features/dashboard/components/admin-overview";
import { OrgDetailsCard } from "@/features/dashboard/components/org-details-card";
import { ReviewStatus } from "@/features/dashboard/components/review-status";
import { WorkflowCard } from "@/features/dashboard/components/workflow-card";
import { getCurrentUser } from "@/lib/session/get-current-user";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const org = user.membership?.organization;

  if (!org) {
    return (
      <PageContainer>
        <PageHeader
          title="Platform overview"
          description="Organizations registered on Origo, by review status."
        />
        {user.isPlatformAdmin ? <AdminOverview /> : null}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={org.name}
        description={`${ORG_TYPE_LABELS[org.type]} · ${org.city}, ${org.country}`}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {org.status === "APPROVED" ? (
            <WorkflowCard type={org.type} />
          ) : (
            <ReviewStatus org={{ ...org, status: org.status }} />
          )}
        </div>
        <OrgDetailsCard org={org} />
      </div>
    </PageContainer>
  );
}
