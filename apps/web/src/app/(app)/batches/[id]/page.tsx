import { DOSAGE_FORM_LABELS } from "@origo/shared";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PaginationLinks } from "@/components/data/pagination-links";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { BatchStatusBadge, ExpiryDate } from "@/features/catalog/components/catalog-badges";
import { DetailList } from "@/features/catalog/components/detail-list";
import { LabelExportPanel } from "@/features/catalog/components/label-export-panel";
import { LabelPreview } from "@/features/catalog/components/label-preview";
import { PacksTable } from "@/features/catalog/components/packs-table";
import { PACKS_PAGE_SIZE } from "@/features/catalog/constants";
import {
  getBatch,
  getLabelPreview,
  getLatestLabelExport,
  listPacks,
} from "@/features/catalog/services/catalog.server";
import { type SearchParams } from "@/features/catalog/types";
import { hrefWith, parsePage } from "@/features/catalog/utils";
import { orNotFound } from "@/lib/api/or-not-found";
import { formatDate, formatNumber } from "@/lib/format";
import { batchPath, productPath, ROUTES } from "@/lib/routes";
import { requireManufacturer } from "@/lib/session/require-manufacturer";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}

export const metadata: Metadata = { title: "Batch" };

export default async function BatchPage({ params, searchParams }: PageProps) {
  const user = await requireManufacturer();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [batch, packs, preview, latest] = await Promise.all([
    orNotFound(getBatch(id)),
    orNotFound(listPacks(id, parsePage(query.page), PACKS_PAGE_SIZE)),
    orNotFound(getLabelPreview(id)),
    orNotFound(getLatestLabelExport(id)),
  ]);
  const maker = user.membership?.organization.name ?? "";

  return (
    <PageContainer>
      <div className="space-y-3">
        <Link
          href={ROUTES.batches}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Batches
        </Link>
        <PageHeader
          title={`Batch ${batch.batchNumber}`}
          description={`${batch.product.name} ${batch.product.strength} · ${DOSAGE_FORM_LABELS[batch.product.dosageForm]} · ${formatNumber(batch.packCount)} packs`}
          actions={<BatchStatusBadge status={batch.status} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <section className="space-y-4" aria-labelledby="labels-heading">
            <h2 id="labels-heading" className="text-base font-semibold">
              QR labels
            </h2>
            <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <LabelPreview batch={batch} preview={preview} maker={maker} />
              <LabelExportPanel batchId={batch.id} packCount={batch.packCount} initial={latest.latest} />
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="packs-heading">
            <h2 id="packs-heading" className="text-base font-semibold">
              Packs{" "}
              <span className="tabular text-muted-foreground font-normal">{formatNumber(packs.total)}</span>
            </h2>
            <PacksTable packs={packs.items} />
            <PaginationLinks
              page={packs.page}
              pageCount={packs.pageCount}
              pageSize={packs.pageSize}
              total={packs.total}
              hrefForPage={(page) => hrefWith(batchPath(batch.id), { page })}
            />
          </section>
        </div>

        <DetailList
          title="Batch details"
          rows={[
            {
              label: "Product",
              value: (
                <Link href={productPath(batch.product.id)} className="text-primary hover:underline">
                  {batch.product.name} {batch.product.strength}
                </Link>
              ),
            },
            { label: "Batch number", value: <span className="font-mono">{batch.batchNumber}</span> },
            { label: "Manufactured", value: formatDate(`${batch.manufacturedOn}T00:00:00Z`) },
            { label: "Expires", value: <ExpiryDate isoDate={batch.expiresOn} /> },
            { label: "Packs", value: <span className="tabular">{formatNumber(batch.packCount)}</span> },
            {
              label: "Pack IDs",
              value: (
                <span className="font-mono text-xs leading-relaxed">
                  {batch.firstPackId}
                  <br />
                  to {batch.lastPackId}
                </span>
              ),
            },
            { label: "Storage", value: batch.storageInstructions },
            { label: "Registered", value: formatDate(batch.createdAt) },
          ]}
        />
      </div>
    </PageContainer>
  );
}
