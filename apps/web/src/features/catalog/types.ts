import { type createBatchSchema, type createProductSchema } from "@origo/shared";
import { type z } from "zod";

export interface ListParams {
  page: number;
  pageSize: number;
  q?: string;
}

export type ProductFormInput = z.input<typeof createProductSchema>;
export type ProductFormOutput = z.output<typeof createProductSchema>;

export type BatchFormInput = z.input<typeof createBatchSchema>;
export type BatchFormOutput = z.output<typeof createBatchSchema>;

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export type ExpiryState = "expired" | "soon" | "ok";
