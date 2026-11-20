import type { Metadata } from "next";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExpiryDate } from "@/features/catalog/components/catalog-badges";
import { TransferStatusBadge } from "@/features/supply/components/supply-badges";
import { TransferActions } from "@/features/supply/components/transfer-actions";
import { TransferParties } from "@/features/supply/components/transfer-parties";
import { getTransfer } from "@/features/supply/services/supply.server";
import { orNotFound } from "@/lib/api/or-not-found";
import { formatDate, formatNumber } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { requireMember } from "@/lib/session/require-member";

export const metadata: Metadata = { title: "Transfer" };

export default async function TransferPage({ params }: { params: Promise<{ id: string }> }) {
  await requireMember();
  const { id } = await params;
  const transfer = await orNotFound(getTransfer(id));
  const waitingOnMe = transfer.actions.accept;

  return (
    <PageContainer className="max-w-4xl">
      <div className="space-y-3">
        <Link
          href={ROUTES.transfers}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Transfers
        </Link>
        <PageHeader
          title={transfer.reference}
          description={`${formatNumber(transfer.packCount)} packs · sent ${formatDate(transfer.createdAt)}${
            transfer.respondedAt ? ` · closed ${formatDate(transfer.respondedAt)}` : ""
          }`}
          actions={<TransferStatusBadge status={transfer.status} />}
        />
      </div>

      {waitingOnMe ? (
        <Alert className="border-warning/40 bg-warning-soft/40">
          <Info className="size-4" aria-hidden="true" />
          <AlertTitle>Check the delivery before accepting</AlertTitle>
          <AlertDescription>
            Accepting moves these packs into your inventory and records the handover in each pack&apos;s
            history. If anything is wrong, reject it with a reason.
          </AlertDescription>
        </Alert>
      ) : null}

      <TransferParties from={transfer.from} to={transfer.to} />

      <section className="space-y-3" aria-labelledby="contents-heading">
        <h2 id="contents-heading" className="text-base font-semibold">
          Contents
        </h2>
        <div className="bg-card overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Product</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="pr-4 text-right">Packs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfer.lines.map((line) => (
                <TableRow key={line.batchId}>
                  <TableCell className="pl-4 font-medium">
                    {line.productName} {line.strength}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{line.batchNumber}</TableCell>
                  <TableCell>
                    <ExpiryDate isoDate={line.expiresOn} />
                  </TableCell>
                  <TableCell className="tabular pr-4 text-right">{formatNumber(line.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {transfer.note ? (
        <section className="space-y-1">
          <h2 className="text-sm font-semibold">Note from {transfer.from.name}</h2>
          <p className="text-muted-foreground text-sm">{transfer.note}</p>
        </section>
      ) : null}

      {transfer.rejectionReason ? (
        <blockquote className="border-destructive bg-destructive-soft/50 rounded-md border-l-2 px-4 py-3 text-sm">
          <span className="text-muted-foreground block text-xs font-medium">
            Rejected by {transfer.to.name}
          </span>
          {transfer.rejectionReason}
        </blockquote>
      ) : null}

      <div className="flex justify-end border-t pt-4">
        <TransferActions transfer={transfer} />
      </div>
    </PageContainer>
  );
}
