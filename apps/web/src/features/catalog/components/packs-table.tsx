import { type PackDto } from "@origo/shared";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { packPath } from "@/lib/routes";
import { PackStatusBadge } from "./catalog-badges";

export const PacksTable = ({ packs }: { packs: PackDto[] }) => (
  <div className="bg-card overflow-x-auto rounded-lg border">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-4">Pack ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-4 text-right">Registered</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packs.map((pack) => (
          <TableRow key={pack.id}>
            <TableCell className="pl-4 font-mono text-sm">
              <Link
                href={packPath(pack.publicId)}
                className="hover:text-primary focus-visible:ring-ring rounded-sm outline-none hover:underline focus-visible:ring-2"
              >
                {pack.publicId}
              </Link>
            </TableCell>
            <TableCell>
              <PackStatusBadge status={pack.status} />
            </TableCell>
            <TableCell className="tabular text-muted-foreground pr-4 text-right">
              {formatDate(pack.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
