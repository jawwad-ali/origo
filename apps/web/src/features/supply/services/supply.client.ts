import { type CreateTransferInput, type TransferDetailDto } from "@origo/shared";
import { clientApi, postJson } from "@/lib/api/client-api";
import { API_ROUTES } from "@/lib/api/constants";

const path = (id: string, action: string): string =>
  `${API_ROUTES.transfers}/${encodeURIComponent(id)}/${action}`;

/** The idempotency key makes a retried submit (double click, flaky network) return the same transfer. */
export const createTransfer = (
  input: CreateTransferInput,
  idempotencyKey: string,
): Promise<TransferDetailDto> =>
  clientApi(API_ROUTES.transfers, {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Idempotency-Key": idempotencyKey },
  });

export const acceptTransfer = (id: string): Promise<TransferDetailDto> => postJson(path(id, "accept"));

export const rejectTransfer = (id: string, reason: string): Promise<TransferDetailDto> =>
  postJson(path(id, "reject"), { reason });

export const cancelTransfer = (id: string): Promise<TransferDetailDto> => postJson(path(id, "cancel"));
