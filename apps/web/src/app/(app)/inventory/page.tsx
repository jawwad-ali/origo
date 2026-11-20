import type { Metadata } from "next";
import { SearchX, Send, Warehouse } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PaginationLinks } from "@/components/data/pagination-links";
import { SearchInput } from "@/components/data/search-input";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { type SearchParams } from "@/features/catalog/types";
import { hrefWith, parsePage, parseSearch } from "@/features/catalog/utils";
import { canSendStock } from "@/features/shell/nav";
import { InventoryTable } from "@/features/supply/components/inventory-table";
import { PackLookup } from "@/features/supply/components/pack-lookup";
import { INVENTORY_PAGE_SIZE } from "@/features/supply/constants";
import { listInventory } from "@/features/supply/services/supply.server";
import { ROUTES } from "@/lib/routes";
import { requireMember } from "@/lib/session/require-member";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireMember();
  const params = await searchParams;
  const q = parseSearch(params.q);
  const result = await listInventory(parsePage(params.page), INVENTORY_PAGE_SIZE, q);
  const canSend = canSendStock(user);

  return (
    <PageContainer>
      <PageHeader
        title="Inventory"
        description="Stock your organization holds right now, by batch. Soonest expiry first."
        actions={
          canSend ? (
            <Button asChild>
              <Link href={ROUTES.newTransfer}>
                <Send className="size-4" aria-hidden="true" />
                Send stock
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Suspense>
            <SearchInput placeholder="Search by product or batch" label="Search inventory" />
          </Suspense>
          <PackLookup />
        </div>
        {result.items.length > 0 ? (
          <InventoryTable lines={result.items} canSend={canSend} />
        ) : q ? (
          <EmptyState
            icon={SearchX}
            title={`Nothing in stock matches "${q}"`}
            description="Try part of the batch number or the product name."
          />
        ) : (
          <EmptyState
            icon={Warehouse}
            title="No stock yet"
            description={
              user.membership?.organization.type === "MANUFACTURER"
                ? "Register a batch and its packs appear here, ready to send to distributors."
                : "Stock appears here when you accept an incoming transfer."
            }
            action={
              <Button variant="outline" asChild>
                <Link href={ROUTES.transfers}>View transfers</Link>
              </Button>
            }
          />
        )}
        <PaginationLinks
          page={result.page}
          pageCount={result.pageCount}
          pageSize={result.pageSize}
          total={result.total}
          hrefForPage={(page) => hrefWith(ROUTES.inventory, { q, page })}
        />
      </div>
    </PageContainer>
  );
}
