import type { Metadata } from "next";
import { ArrowRight, Boxes, SearchX } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PaginationLinks } from "@/components/data/pagination-links";
import { SearchInput } from "@/components/data/search-input";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { BatchesTable } from "@/features/catalog/components/batches-table";
import { BATCHES_PAGE_SIZE } from "@/features/catalog/constants";
import { listBatches } from "@/features/catalog/services/catalog.server";
import { type SearchParams } from "@/features/catalog/types";
import { hrefWith, parsePage, parseSearch } from "@/features/catalog/utils";
import { ROUTES } from "@/lib/routes";
import { requireManufacturer } from "@/lib/session/require-manufacturer";

export const metadata: Metadata = { title: "Batches" };

export default async function BatchesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireManufacturer();
  const params = await searchParams;
  const q = parseSearch(params.q);
  const result = await listBatches({ page: parsePage(params.page), pageSize: BATCHES_PAGE_SIZE, q });

  return (
    <PageContainer>
      <PageHeader
        title="Batches"
        description="Every batch you've registered, newest first. Open one to see its packs and print QR labels."
      />
      <div className="space-y-4">
        <Suspense>
          <SearchInput placeholder="Search by batch number or product" label="Search batches" />
        </Suspense>
        {result.items.length > 0 ? (
          <BatchesTable batches={result.items} />
        ) : q ? (
          <EmptyState
            icon={SearchX}
            title={`No batches match "${q}"`}
            description="Batch numbers are matched as typed; try part of the number or the product name."
          />
        ) : (
          <EmptyState
            icon={Boxes}
            title="No batches yet"
            description="Batches are registered from a product's page. Pick a product to register its first batch."
            action={
              <Button asChild>
                <Link href={ROUTES.products}>
                  Go to products
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            }
          />
        )}
        <PaginationLinks
          page={result.page}
          pageCount={result.pageCount}
          pageSize={result.pageSize}
          total={result.total}
          hrefForPage={(page) => hrefWith(ROUTES.batches, { q, page })}
        />
      </div>
    </PageContainer>
  );
}
