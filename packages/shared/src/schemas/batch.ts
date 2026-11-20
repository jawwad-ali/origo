import { z } from "zod";
import { BATCH_NUMBER_MAX_LENGTH, MAX_PACKS_PER_BATCH } from "../constants";
import { isoDateSchema, pageQuerySchema, searchTermSchema } from "./common";

export const createBatchSchema = z
  .object({
    batchNumber: z
      .string()
      .trim()
      .min(2, "Enter the batch number")
      .max(BATCH_NUMBER_MAX_LENGTH)
      .regex(/^[A-Za-z0-9][A-Za-z0-9\-/]*$/, "Use letters, numbers, - and / only")
      .transform((value) => value.toUpperCase()),
    manufacturedOn: isoDateSchema,
    expiresOn: isoDateSchema,
    packCount: z.coerce
      .number({ error: "Enter how many packs" })
      .int("Use a whole number")
      .min(1, "Register at least one pack")
      .max(MAX_PACKS_PER_BATCH, `At most ${MAX_PACKS_PER_BATCH.toLocaleString("en-US")} packs per batch`),
  })
  .refine((batch) => batch.expiresOn > batch.manufacturedOn, {
    path: ["expiresOn"],
    error: "Expiry must be after the manufacturing date",
  });
export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export const listBatchesQuerySchema = pageQuerySchema.extend({
  q: searchTermSchema,
  productId: z.uuid().optional(),
});
export type ListBatchesQuery = z.infer<typeof listBatchesQuerySchema>;
