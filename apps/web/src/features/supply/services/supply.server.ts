import "server-only";
import {
  type InventoryLineDto,
  type OrgRefDto,
  type PackHistoryDto,
  type PaginatedDto,
  type TransferDetailDto,
  type TransferDirection,
  type TransferSummaryDto,
} from "@origo/shared";
import { API_ROUTES } from "@/lib/api/constants";
import { serverApi } from "@/lib/api/server-api";

const qs = (params: Record<string, string | number | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
};

export const listInventory = (
  page: number,
  pageSize: number,
  q?: string,
): Promise<PaginatedDto<InventoryLineDto>> =>
  serverApi(`${API_ROUTES.inventory}?${qs({ page, pageSize, q })}`);

export const listTransfers = (
  direction: TransferDirection,
  page: number,
  pageSize: number,
): Promise<PaginatedDto<TransferSummaryDto>> =>
  serverApi(`${API_ROUTES.transfers}?${qs({ direction, page, pageSize })}`);

export const getTransfer = (id: string): Promise<TransferDetailDto> =>
  serverApi(`${API_ROUTES.transfers}/${encodeURIComponent(id)}`);

export const getRecipients = (): Promise<OrgRefDto[]> => serverApi(`${API_ROUTES.transfers}/recipients`);

export const getPendingIncomingCount = async (): Promise<number> =>
  (await serverApi<{ count: number }>(`${API_ROUTES.transfers}/pending-count`)).count;

export const getPackHistory = (publicId: string): Promise<PackHistoryDto> =>
  serverApi(`${API_ROUTES.packs}/${encodeURIComponent(publicId)}/history`);
