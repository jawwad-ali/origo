import { DOSAGE_FORM_LABELS, type ProductDto } from "@origo/shared";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/format";
import { productPath } from "@/lib/routes";

const ProductLink = ({ product }: { product: ProductDto }) => (
  <Link
    href={productPath(product.id)}
    className="hover:text-primary focus-visible:ring-ring rounded-sm font-medium outline-none hover:underline focus-visible:ring-2"
  >
    {product.name}
  </Link>
);

export const ProductsTable = ({ products }: { products: ProductDto[] }) => (
  <>
    <div className="bg-card hidden overflow-hidden rounded-lg border md:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">Product</TableHead>
            <TableHead>Strength</TableHead>
            <TableHead>Form</TableHead>
            <TableHead>Pack size</TableHead>
            <TableHead className="text-right">Batches</TableHead>
            <TableHead className="pr-4 text-right">Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="max-w-72 pl-4">
                <ProductLink product={product} />
                <span className="text-muted-foreground block truncate text-xs">{product.genericName}</span>
              </TableCell>
              <TableCell>{product.strength}</TableCell>
              <TableCell>{DOSAGE_FORM_LABELS[product.dosageForm]}</TableCell>
              <TableCell className="text-muted-foreground">{product.packSize}</TableCell>
              <TableCell className="tabular text-right">{formatNumber(product.batchCount)}</TableCell>
              <TableCell className="tabular text-muted-foreground pr-4 text-right">
                {formatDate(product.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <ul className="bg-card divide-y rounded-lg border md:hidden">
      {products.map((product) => (
        <li key={product.id} className="space-y-1 p-4">
          <ProductLink product={product} />
          <p className="text-muted-foreground text-sm">
            {product.genericName} · {product.strength} · {DOSAGE_FORM_LABELS[product.dosageForm]}
          </p>
          <p className="tabular text-muted-foreground text-xs">
            {formatNumber(product.batchCount)} {product.batchCount === 1 ? "batch" : "batches"}
          </p>
        </li>
      ))}
    </ul>
  </>
);
