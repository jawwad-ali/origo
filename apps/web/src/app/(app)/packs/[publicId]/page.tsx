import { DOSAGE_FORM_LABELS, ORG_TYPE_LABELS } from "@origo/shared";
import type { Metadata } from "next";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpiryDate, PackStatusBadge } from "@/features/catalog/components/catalog-badges";
import { DetailList } from "@/features/catalog/components/detail-list";
import { DispenseButton } from "@/features/supply/components/dispense-button";
import { PackTimeline } from "@/features/supply/components/pack-timeline";
import { ChainBadge } from "@/features/supply/components/supply-badges";
import { getPackHistory } from "@/features/supply/services/supply.server";
import { orNotFound } from "@/lib/api/or-not-found";
import { ROUTES } from "@/lib/routes";
import { requireMember } from "@/lib/session/require-member";

interface PageProps {
  params: Promise<{ publicId: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => ({
  title: decodeURIComponent((await params).publicId),
});

export default async function PackPage({ params }: PageProps) {
  const user = await requireMember();
  const { publicId } = await params;
  const pack = await orNotFound(getPackHistory(decodeURIComponent(publicId)));
  const { batch } = pack;
  const canDispense =
    user.membership?.organization.type === "PHARMACY" &&
    user.membership.organization.id === pack.currentOwner.id &&
    pack.status === "IN_STOCK" &&
    batch.status === "ACTIVE";

  return (
    <PageContainer>
      <div className="space-y-3">
        <Link
          href={ROUTES.inventory}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Inventory
        </Link>
        <PageHeader
          title={pack.publicId}
          description={`${batch.product.name} ${batch.product.strength} · Batch ${batch.batchNumber}`}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <ChainBadge chain={pack.chain} />
              {canDispense ? <DispenseButton publicId={pack.publicId} /> : null}
            </div>
          }
        />
      </div>

      {!pack.chain.intact ? (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden="true" />
          <AlertTitle>This history doesn&apos;t add up</AlertTitle>
          <AlertDescription>
            Event {pack.chain.brokenAtSeq} doesn&apos;t match the record before it, so the history may have
            been altered. Don&apos;t move this pack until the Origo team has checked it.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0 gap-5">
          <CardHeader>
            <CardTitle className="text-base">Journey</CardTitle>
            <p className="text-muted-foreground text-sm">
              Every handover, oldest first. Each entry is sealed with a hash of the one before it, so a
              changed or missing step breaks the chain.
            </p>
          </CardHeader>
          <CardContent>
            <PackTimeline events={pack.events} />
          </CardContent>
        </Card>

        <DetailList
          title="Pack"
          rows={[
            { label: "Status", value: <PackStatusBadge status={pack.status} /> },
            {
              label: "Held by",
              value: (
                <span>
                  {pack.currentOwner.name}
                  <span className="text-muted-foreground block text-xs">
                    {ORG_TYPE_LABELS[pack.currentOwner.type]} · {pack.currentOwner.city}
                  </span>
                </span>
              ),
            },
            {
              label: "Product",
              value: `${batch.product.name} ${batch.product.strength} · ${DOSAGE_FORM_LABELS[batch.product.dosageForm]}`,
            },
            { label: "Pack size", value: batch.product.packSize },
            { label: "Batch", value: <span className="font-mono">{batch.batchNumber}</span> },
            { label: "Expires", value: <ExpiryDate isoDate={batch.expiresOn} /> },
          ]}
        />
      </div>
    </PageContainer>
  );
}
