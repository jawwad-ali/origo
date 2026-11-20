import { type PackDto } from "@origo/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
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
            <TableCell className="pl-4 font-mono text-sm">{pack.publicId}</TableCell>
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
