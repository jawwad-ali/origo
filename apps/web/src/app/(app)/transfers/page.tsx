import { TRANSFER_DIRECTIONS, type TransferDirection } from "@origo/shared";
import type { Metadata } from "next";
import { ArrowDownToLine, ArrowUpFromLine, Send } from "lucide-react";
import Link from "next/link";
import { PaginationLinks } from "@/components/data/pagination-links";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { type SearchParams } from "@/features/catalog/types";
import { hrefWith, parsePage } from "@/features/catalog/utils";
import { canSendStock } from "@/features/shell/nav";
import { DirectionTabs } from "@/features/supply/components/direction-tabs";
import { TransfersTable } from "@/features/supply/components/transfers-table";
import { TRANSFERS_PAGE_SIZE } from "@/features/supply/constants";
import { getPendingIncomingCount, listTransfers } from "@/features/supply/services/supply.server";
import { ROUTES } from "@/lib/routes";
import { requireMember } from "@/lib/session/require-member";

export const metadata: Metadata = { title: "Transfers" };

const parseDirection = (value: string | string[] | undefined): TransferDirection =>
  TRANSFER_DIRECTIONS.find((direction) => direction === value) ?? "incoming";

export default async function TransfersPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireMember();
  const params = await searchParams;
  const direction = parseDirection(params.direction);
  const [result, pending] = await Promise.all([
    listTransfers(direction, parsePage(params.page), TRANSFERS_PAGE_SIZE),
    getPendingIncomingCount(),
  ]);
  const canSend = canSendStock(user);

  return (
    <PageContainer>
      <PageHeader
        title="Transfers"
        description="Every handover of packs, in and out. Stock changes hands only when the receiver accepts."
        actions={
          canSend ? (
            <Button asChild>
              <Link href={ROUTES.newTransfer}>
                <Send className="size-4" aria-hidden="true" />
                New transfer
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="space-y-4">
        <DirectionTabs active={direction} pending={pending} />
        {result.items.length > 0 ? (
          <TransfersTable transfers={result.items} direction={direction} />
        ) : direction === "incoming" ? (
          <EmptyState
            icon={ArrowDownToLine}
            title="Nothing incoming"
            description="When a supplier sends you packs, the transfer waits here for you to accept or reject."
          />
        ) : (
          <EmptyState
            icon={ArrowUpFromLine}
            title="You haven't sent anything yet"
            description={
              canSend
                ? "Pick a batch from your inventory and choose who receives it."
                : "Pharmacies receive stock; they don't send it on."
            }
            action={
              canSend ? (
                <Button asChild>
                  <Link href={ROUTES.newTransfer}>New transfer</Link>
                </Button>
              ) : undefined
            }
          />
        )}
        <PaginationLinks
          page={result.page}
          pageCount={result.pageCount}
          pageSize={result.pageSize}
          total={result.total}
          hrefForPage={(page) => hrefWith(ROUTES.transfers, { direction, page })}
        />
      </div>
    </PageContainer>
  );
}
