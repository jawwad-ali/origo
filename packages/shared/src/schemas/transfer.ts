import { z } from "zod";
import {
  MAX_PACKS_PER_TRANSFER,
  MAX_TRANSFER_LINES,
  REJECTION_REASON_MAX_LENGTH,
  TRANSFER_NOTE_MAX_LENGTH,
} from "../constants";
import { TRANSFER_DIRECTIONS, TRANSFER_STATUSES } from "../enums";
import { pageQuerySchema } from "./common";

export const transferLineSchema = z.object({
  batchId: z.uuid("Choose a batch"),
  quantity: z.coerce
    .number({ error: "Enter a quantity" })
    .int("Use a whole number")
    .min(1, "Send at least one pack")
    .max(MAX_PACKS_PER_TRANSFER),
});
export type TransferLineInput = z.infer<typeof transferLineSchema>;

export const createTransferSchema = z
  .object({
    toOrganizationId: z.uuid("Choose who receives the stock"),
    lines: z.array(transferLineSchema).min(1, "Add at least one batch").max(MAX_TRANSFER_LINES),
    note: z.string().trim().max(TRANSFER_NOTE_MAX_LENGTH).optional(),
  })
  .refine((t) => new Set(t.lines.map((l) => l.batchId)).size === t.lines.length, {
    path: ["lines"],
    error: "Each batch can appear only once",
  })
  .refine((t) => t.lines.reduce((sum, l) => sum + l.quantity, 0) <= MAX_PACKS_PER_TRANSFER, {
    path: ["lines"],
    error: `At most ${MAX_PACKS_PER_TRANSFER.toLocaleString("en-US")} packs per transfer`,
  });
export type CreateTransferInput = z.infer<typeof createTransferSchema>;

export const rejectTransferSchema = z.object({
  reason: z.string().trim().min(5, "Give a short reason").max(REJECTION_REASON_MAX_LENGTH),
});
export type RejectTransferInput = z.infer<typeof rejectTransferSchema>;

export const listTransfersQuerySchema = pageQuerySchema.extend({
  direction: z.enum(TRANSFER_DIRECTIONS).default("incoming"),
  status: z.enum(TRANSFER_STATUSES).optional(),
});
export type ListTransfersQuery = z.infer<typeof listTransfersQuerySchema>;

export const directoryQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});
export type DirectoryQuery = z.infer<typeof directoryQuerySchema>;
