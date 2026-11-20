import { type createTransferSchema } from "@origo/shared";
import { type z } from "zod";

export type TransferFormInput = z.input<typeof createTransferSchema>;
export type TransferFormOutput = z.output<typeof createTransferSchema>;

/** A batch the sender can pick in the transfer form. */
export interface SendableBatch {
  id: string;
  label: string;
  batchNumber: string;
  inStock: number;
}
