import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { notFound } from "next/navigation";
import { PaginationLinks } from "@/components/data/pagination-links";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { OrgCardList } from "@/features/admin-orgs/components/org-card-list";
import { OrgTable } from "@/features/admin-orgs/components/org-table";
import { StatusTabs } from "@/features/admin-orgs/components/status-tabs";
import { EMPTY_COPY, ORGS_PAGE_SIZE } from "@/features/admin-orgs/constants";
import { getStatusCounts, listOrganizations } from "@/features/admin-orgs/services/admin-orgs.server";
import { parsePage, parseStatus } from "@/features/admin-orgs/utils";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser } from "@/lib/session/get-current-user";

export const metadata: Metadata = { title: "Organizations" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminOrganizationsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user.isPlatformAdmin) notFound();

  const params = await searchParams;
  const status = parseStatus(params.status);
  const page = parsePage(params.page);
  const [result, counts] = await Promise.all([
    listOrganizations({ status, page, pageSize: ORGS_PAGE_SIZE }),
    getStatusCounts(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Organizations"
        description="Review registrations and manage who can record on Origo."
      />
      <div className="space-y-4">
        <StatusTabs active={status} counts={counts} />
        {result.items.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={EMPTY_COPY[status].title}
            description={EMPTY_COPY[status].body}
          />
        ) : (
          <>
            <OrgTable orgs={result.items} />
            <OrgCardList orgs={result.items} />
          </>
        )}
        <PaginationLinks
          page={result.page}
          pageCount={result.pageCount}
          pageSize={result.pageSize}
          total={result.total}
          hrefForPage={(next) => `${ROUTES.adminOrganizations}?status=${status}&page=${next}`}
        />
      </div>
    </PageContainer>
  );
}
