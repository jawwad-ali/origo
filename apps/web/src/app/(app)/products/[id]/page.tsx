import { DOSAGE_FORM_LABELS } from "@origo/shared";
import type { Metadata } from "next";
import { Boxes, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PaginationLinks } from "@/components/data/pagination-links";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { BatchFormSheet } from "@/features/catalog/components/batch-form-sheet";
import { BatchesTable } from "@/features/catalog/components/batches-table";
import { DetailList } from "@/features/catalog/components/detail-list";
import { BATCHES_PAGE_SIZE } from "@/features/catalog/constants";
import { getProduct, listBatches } from "@/features/catalog/services/catalog.server";
import { type SearchParams } from "@/features/catalog/types";
import { hrefWith, parsePage } from "@/features/catalog/utils";
import { orNotFound } from "@/lib/api/or-not-found";
import { formatDate, formatNumber } from "@/lib/format";
import { productPath, ROUTES } from "@/lib/routes";
import { requireManufacturer } from "@/lib/session/require-manufacturer";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}

export const metadata: Metadata = { title: "Product" };

export default async function ProductPage({ params, searchParams }: PageProps) {
  await requireManufacturer();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [product, batches] = await Promise.all([
    orNotFound(getProduct(id)),
    orNotFound(listBatches({ productId: id, page: parsePage(query.page), pageSize: BATCHES_PAGE_SIZE })),
  ]);
  const productLabel = `${product.name} ${product.strength}`;

  return (
    <PageContainer>
      <div className="space-y-3">
        <Link
          href={ROUTES.products}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Products
        </Link>
        <PageHeader
          title={productLabel}
          description={`${product.genericName} · ${DOSAGE_FORM_LABELS[product.dosageForm]} · ${product.packSize}`}
          actions={<BatchFormSheet productId={product.id} productLabel={productLabel} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0 space-y-4" aria-labelledby="batches-heading">
          <h2 id="batches-heading" className="text-base font-semibold">
            Batches{" "}
            <span className="tabular text-muted-foreground font-normal">{formatNumber(batches.total)}</span>
          </h2>
          {batches.items.length > 0 ? (
            <BatchesTable batches={batches.items} showProduct={false} />
          ) : (
            <EmptyState
              icon={Boxes}
              title="No batches yet"
              description="Register a batch to create a unique, signed ID for every pack in it."
              action={<BatchFormSheet productId={product.id} productLabel={productLabel} />}
            />
          )}
          <PaginationLinks
            page={batches.page}
            pageCount={batches.pageCount}
            pageSize={batches.pageSize}
            total={batches.total}
            hrefForPage={(page) => hrefWith(productPath(product.id), { page })}
          />
        </section>

        <DetailList
          title="Product details"
          rows={[
            { label: "Brand name", value: product.name },
            { label: "Generic name", value: product.genericName },
            { label: "Strength", value: product.strength },
            { label: "Dosage form", value: DOSAGE_FORM_LABELS[product.dosageForm] },
            { label: "Pack size", value: product.packSize },
            { label: "Storage", value: product.storageInstructions },
            { label: "Added", value: formatDate(product.createdAt) },
          ]}
        />
      </div>
    </PageContainer>
  );
}
