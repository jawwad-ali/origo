import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

interface PaginationLinksProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  hrefForPage: (page: number) => string;
}

/** Server-rendered pagination: plain links, so the page number lives in the URL. */
export const PaginationLinks = ({ page, pageCount, pageSize, total, hrefForPage }: PaginationLinksProps) => {
  if (pageCount <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="tabular text-muted-foreground text-sm">
        {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefForPage(page - 1)}>
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>
        )}
        {page < pageCount ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefForPage(page + 1)}>
              Next
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </nav>
  );
};
