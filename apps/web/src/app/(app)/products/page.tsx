import type { Metadata } from "next";
import { Pill, SearchX } from "lucide-react";
import { Suspense } from "react";
import { PaginationLinks } from "@/components/data/pagination-links";
import { SearchInput } from "@/components/data/search-input";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ProductFormSheet } from "@/features/catalog/components/product-form-sheet";
import { ProductsTable } from "@/features/catalog/components/products-table";
import { PRODUCTS_PAGE_SIZE } from "@/features/catalog/constants";
import { listProducts } from "@/features/catalog/services/catalog.server";
import { type SearchParams } from "@/features/catalog/types";
import { hrefWith, parsePage, parseSearch } from "@/features/catalog/utils";
import { ROUTES } from "@/lib/routes";
import { requireManufacturer } from "@/lib/session/require-manufacturer";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireManufacturer();
  const params = await searchParams;
  const q = parseSearch(params.q);
  const result = await listProducts({ page: parsePage(params.page), pageSize: PRODUCTS_PAGE_SIZE, q });

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description="The medicines you make. Register batches against a product to give each pack its own ID."
        actions={<ProductFormSheet />}
      />
      <div className="space-y-4">
        <Suspense>
          <SearchInput placeholder="Search by brand or generic name" label="Search products" />
        </Suspense>
        {result.items.length > 0 ? (
          <ProductsTable products={result.items} />
        ) : q ? (
          <EmptyState
            icon={SearchX}
            title={`No products match "${q}"`}
            description="Check the spelling, or search by the generic name instead."
          />
        ) : (
          <EmptyState
            icon={Pill}
            title="No products yet"
            description="Add the first medicine you make. You'll register its batches and print QR labels next."
            action={<ProductFormSheet triggerLabel="Add your first product" />}
          />
        )}
        <PaginationLinks
          page={result.page}
          pageCount={result.pageCount}
          pageSize={result.pageSize}
          total={result.total}
          hrefForPage={(page) => hrefWith(ROUTES.products, { q, page })}
        />
      </div>
    </PageContainer>
  );
}
