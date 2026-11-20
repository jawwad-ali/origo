import { ORG_TYPE_LABELS, type TransferDirection, type TransferSummaryDto } from "@origo/shared";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/format";
import { transferPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { TransferStatusBadge } from "./supply-badges";

interface TransfersTableProps {
  transfers: TransferSummaryDto[];
  direction: TransferDirection;
}

const ReferenceLink = ({ transfer }: { transfer: TransferSummaryDto }) => (
  <Link
    href={transferPath(transfer.id)}
    className="hover:text-primary focus-visible:ring-ring rounded-sm font-mono text-sm font-medium outline-none hover:underline focus-visible:ring-2"
  >
    {transfer.reference}
  </Link>
);

export const TransfersTable = ({ transfers, direction }: TransfersTableProps) => {
  const other = (transfer: TransferSummaryDto) => (direction === "incoming" ? transfer.from : transfer.to);
  const needsAction = (transfer: TransferSummaryDto): boolean =>
    direction === "incoming" && transfer.status === "PENDING";

  return (
    <>
      <div className="bg-card hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Reference</TableHead>
              <TableHead>{direction === "incoming" ? "From" : "To"}</TableHead>
              <TableHead className="text-right">Packs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer) => (
              <TableRow key={transfer.id} className={cn(needsAction(transfer) && "bg-warning-soft/30")}>
                <TableCell className="pl-4">
                  <ReferenceLink transfer={transfer} />
                </TableCell>
                <TableCell className="max-w-72">
                  <span className="block truncate">{other(transfer).name}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {ORG_TYPE_LABELS[other(transfer).type]} · {other(transfer).city}
                  </span>
                </TableCell>
                <TableCell className="tabular text-right">{formatNumber(transfer.packCount)}</TableCell>
                <TableCell>
                  <TransferStatusBadge status={transfer.status} />
                </TableCell>
                <TableCell className="tabular text-muted-foreground pr-4 text-right">
                  {formatDate(transfer.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="bg-card divide-y rounded-lg border md:hidden">
        {transfers.map((transfer) => (
          <li
            key={transfer.id}
            className={cn("space-y-1.5 p-4", needsAction(transfer) && "bg-warning-soft/30")}
          >
            <div className="flex items-center justify-between gap-3">
              <ReferenceLink transfer={transfer} />
              <TransferStatusBadge status={transfer.status} />
            </div>
            <p className="truncate text-sm">
              {direction === "incoming" ? "From" : "To"} {other(transfer).name}
            </p>
            <p className="tabular text-muted-foreground text-xs">
              {formatNumber(transfer.packCount)} packs · {formatDate(transfer.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
};
