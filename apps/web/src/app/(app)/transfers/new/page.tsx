import type { Metadata } from "next";
import { ArrowRight, ChevronLeft, Warehouse } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type SearchParams } from "@/features/catalog/types";
import { expiryState } from "@/features/catalog/utils";
import { canSendStock } from "@/features/shell/nav";
import { TransferForm } from "@/features/supply/components/transfer-form";
import { getRecipients, listInventory } from "@/features/supply/services/supply.server";
import { type SendableBatch } from "@/features/supply/types";
import { ROUTES } from "@/lib/routes";
import { requireMember } from "@/lib/session/require-member";

export const metadata: Metadata = { title: "New transfer" };

/** Enough for any realistic stock list in one form; very large holders search first. */
const BATCH_OPTIONS_LIMIT = 100;

export default async function NewTransferPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireMember();
  if (!canSendStock(user)) notFound();
  const params = await searchParams;
  const [recipients, inventory] = await Promise.all([getRecipients(), listInventory(1, BATCH_OPTIONS_LIMIT)]);

  const batches: SendableBatch[] = inventory.items
    .filter(
      (line) =>
        line.inStock > 0 && line.batch.status === "ACTIVE" && expiryState(line.batch.expiresOn) !== "expired",
    )
    .map((line) => ({
      id: line.batch.id,
      batchNumber: line.batch.batchNumber,
      label: `${line.batch.product.name} ${line.batch.product.strength} · ${line.batch.batchNumber}`,
      inStock: line.inStock,
    }));
  const requested = typeof params.batch === "string" ? params.batch : undefined;
  const initialBatchId = batches.some((batch) => batch.id === requested) ? requested : undefined;

  return (
    <PageContainer className="max-w-3xl">
      <div className="space-y-3">
        <Link
          href={ROUTES.transfers}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Transfers
        </Link>
        <PageHeader
          title="New transfer"
          description="The packs are reserved now and change hands when the receiver accepts. You can cancel until then."
        />
      </div>
      {batches.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title="Nothing to send"
          description="You have no active, unexpired stock right now."
          action={
            <Button variant="outline" asChild>
              <Link href={ROUTES.inventory}>
                Open inventory
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent>
            <TransferForm recipients={recipients} batches={batches} initialBatchId={initialBatchId} />
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
