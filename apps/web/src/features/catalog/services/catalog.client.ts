import {
  type BatchDetailDto,
  type CreateBatchInput,
  type CreateProductInput,
  type LabelExportDto,
  type ProductDto,
} from "@origo/shared";
import { clientApi, postJson } from "@/lib/api/client-api";
import { API_PREFIX, API_ROUTES } from "@/lib/api/constants";

const id = (value: string): string => encodeURIComponent(value);

export const createProduct = (input: CreateProductInput): Promise<ProductDto> =>
  postJson(API_ROUTES.products, input);

export const registerBatch = (productId: string, input: CreateBatchInput): Promise<BatchDetailDto> =>
  postJson(`${API_ROUTES.products}/${id(productId)}/batches`, input);

export const requestLabelExport = (batchId: string): Promise<LabelExportDto> =>
  postJson(`${API_ROUTES.batches}/${id(batchId)}/label-exports`);

export const getLabelExport = (exportId: string): Promise<LabelExportDto> =>
  clientApi(`${API_ROUTES.labelExports}/${id(exportId)}`);

/** Same-origin download URL; the browser sends the auth cookie through the proxy. */
export const labelExportFileUrl = (exportId: string): string =>
  `${API_PREFIX}${API_ROUTES.labelExports}/${id(exportId)}/file`;
