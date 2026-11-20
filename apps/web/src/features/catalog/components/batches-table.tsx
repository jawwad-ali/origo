import { type BatchSummaryDto } from "@origo/shared";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/format";
import { batchPath } from "@/lib/routes";
import { BatchStatusBadge, ExpiryDate } from "./catalog-badges";

interface BatchesTableProps {
  batches: BatchSummaryDto[];
  /** Hide the product column when the table already sits on a product's page. */
  showProduct?: boolean;
}

const BatchLink = ({ batch }: { batch: BatchSummaryDto }) => (
  <Link
    href={batchPath(batch.id)}
    className="hover:text-primary focus-visible:ring-ring rounded-sm font-mono text-sm font-medium outline-none hover:underline focus-visible:ring-2"
  >
    {batch.batchNumber}
  </Link>
);

export const BatchesTable = ({ batches, showProduct = true }: BatchesTableProps) => (
  <>
    <div className="bg-card hidden overflow-hidden rounded-lg border md:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">Batch</TableHead>
            {showProduct ? <TableHead>Product</TableHead> : null}
            <TableHead className="text-right">Packs</TableHead>
            <TableHead>Manufactured</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="pr-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell className="pl-4">
                <BatchLink batch={batch} />
              </TableCell>
              {showProduct ? (
                <TableCell className="max-w-64">
                  <span className="block truncate">
                    {batch.product.name} {batch.product.strength}
                  </span>
                </TableCell>
              ) : null}
              <TableCell className="tabular text-right">{formatNumber(batch.packCount)}</TableCell>
              <TableCell className="tabular text-muted-foreground">
                {formatDate(`${batch.manufacturedOn}T00:00:00Z`)}
              </TableCell>
              <TableCell>
                <ExpiryDate isoDate={batch.expiresOn} />
              </TableCell>
              <TableCell className="pr-4">
                <BatchStatusBadge status={batch.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <ul className="bg-card divide-y rounded-lg border md:hidden">
      {batches.map((batch) => (
        <li key={batch.id} className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-3">
            <BatchLink batch={batch} />
            <BatchStatusBadge status={batch.status} />
          </div>
          {showProduct ? (
            <p className="text-sm">
              {batch.product.name} {batch.product.strength}
            </p>
          ) : null}
          <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
            <span className="tabular">{formatNumber(batch.packCount)} packs</span>·<span>Expires</span>
            <ExpiryDate isoDate={batch.expiresOn} />
          </p>
        </li>
      ))}
    </ul>
  </>
);
