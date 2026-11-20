import "server-only";
import {
  type BatchDetailDto,
  type BatchSummaryDto,
  type LabelPreviewDto,
  type LatestLabelExportDto,
  type PackDto,
  type PaginatedDto,
  type ProductDto,
} from "@origo/shared";
import { API_ROUTES } from "@/lib/api/constants";
import { serverApi } from "@/lib/api/server-api";
import { type ListParams } from "../types";

const query = (params: Record<string, string | number | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
};

const id = (value: string): string => encodeURIComponent(value);

export const listProducts = (params: ListParams): Promise<PaginatedDto<ProductDto>> =>
  serverApi(`${API_ROUTES.products}?${query({ ...params })}`);

export const getProduct = (productId: string): Promise<ProductDto> =>
  serverApi(`${API_ROUTES.products}/${id(productId)}`);

export const listBatches = (
  params: ListParams & { productId?: string },
): Promise<PaginatedDto<BatchSummaryDto>> => serverApi(`${API_ROUTES.batches}?${query({ ...params })}`);

export const getBatch = (batchId: string): Promise<BatchDetailDto> =>
  serverApi(`${API_ROUTES.batches}/${id(batchId)}`);

export const listPacks = (batchId: string, page: number, pageSize: number): Promise<PaginatedDto<PackDto>> =>
  serverApi(`${API_ROUTES.batches}/${id(batchId)}/packs?${query({ page, pageSize })}`);

export const getLabelPreview = (batchId: string): Promise<LabelPreviewDto> =>
  serverApi(`${API_ROUTES.batches}/${id(batchId)}/label-preview`);

export const getLatestLabelExport = (batchId: string): Promise<LatestLabelExportDto> =>
  serverApi(`${API_ROUTES.batches}/${id(batchId)}/label-exports/latest`);
