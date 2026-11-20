import { type InventoryLineDto } from "@origo/shared";
import { Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BatchStatusBadge, ExpiryDate } from "@/features/catalog/components/catalog-badges";
import { expiryState } from "@/features/catalog/utils";
import { formatNumber } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

interface InventoryTableProps {
  lines: InventoryLineDto[];
  canSend: boolean;
}

/** A line can be sent when there is stock, the batch is active and not expired. */
const sendable = (line: InventoryLineDto): boolean =>
  line.inStock > 0 && line.batch.status === "ACTIVE" && expiryState(line.batch.expiresOn) !== "expired";

const SendLink = ({ line }: { line: InventoryLineDto }) => (
  <Button variant="outline" size="sm" asChild>
    <Link href={`${ROUTES.newTransfer}?batch=${encodeURIComponent(line.batch.id)}`}>
      <Send className="size-3.5" aria-hidden="true" />
      Send
    </Link>
  </Button>
);

export const InventoryTable = ({ lines, canSend }: InventoryTableProps) => (
  <>
    <div className="bg-card hidden overflow-hidden rounded-lg border md:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">Product</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">In stock</TableHead>
            <TableHead className="text-right">In transit</TableHead>
            <TableHead>Status</TableHead>
            {canSend ? (
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.batch.id}>
              <TableCell className="max-w-64 pl-4">
                <span className="block truncate font-medium">
                  {line.batch.product.name} {line.batch.product.strength}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {line.batch.product.packSize}
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm">{line.batch.batchNumber}</TableCell>
              <TableCell>
                <ExpiryDate isoDate={line.batch.expiresOn} />
              </TableCell>
              <TableCell className="tabular text-right font-medium">{formatNumber(line.inStock)}</TableCell>
              <TableCell className="tabular text-muted-foreground text-right">
                {line.inTransit > 0 ? formatNumber(line.inTransit) : "—"}
              </TableCell>
              <TableCell>
                <BatchStatusBadge status={line.batch.status} />
              </TableCell>
              {canSend ? (
                <TableCell className="pr-4 text-right">
                  {sendable(line) ? <SendLink line={line} /> : null}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <ul className="bg-card divide-y rounded-lg border md:hidden">
      {lines.map((line) => (
        <li key={line.batch.id} className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">
                {line.batch.product.name} {line.batch.product.strength}
              </p>
              <p className="text-muted-foreground font-mono text-xs">{line.batch.batchNumber}</p>
            </div>
            {canSend && sendable(line) ? <SendLink line={line} /> : null}
          </div>
          <p className="tabular text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm">
            <span className="text-foreground font-medium">{formatNumber(line.inStock)} in stock</span>
            {line.inTransit > 0 ? <span>· {formatNumber(line.inTransit)} in transit</span> : null}
            <span>·</span>
            <ExpiryDate isoDate={line.batch.expiresOn} />
          </p>
        </li>
      ))}
    </ul>
  </>
);
