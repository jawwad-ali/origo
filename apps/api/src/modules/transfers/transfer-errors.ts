import { HttpStatus } from "@nestjs/common";
import { DomainException, InvalidStateException } from "../../common/exceptions/domain.exceptions";

export class NotAllowedRecipientException extends InvalidStateException {
  constructor(detail: string) {
    super("recipient-not-allowed", "Can't send to this organization", detail);
  }
}

export class InsufficientStockException extends InvalidStateException {
  constructor(batchNumber: string, requested: number, available: number) {
    super(
      "insufficient-stock",
      "Not enough packs in stock",
      `Batch ${batchNumber} has ${available.toLocaleString("en-US")} packs available; you asked for ${requested.toLocaleString("en-US")}.`,
    );
  }
}

export class BatchNotSendableException extends InvalidStateException {
  constructor(batchNumber: string, reason: "recalled" | "expired") {
    super(
      `batch-${reason}`,
      reason === "recalled" ? "Batch is recalled" : "Batch has expired",
      `Packs from batch ${batchNumber} can't be transferred because the batch is ${reason}.`,
    );
  }
}

export class TransferNotPendingException extends DomainException {
  constructor(status: string) {
    super(
      HttpStatus.CONFLICT,
      "transfer-closed",
      "Transfer already closed",
      `This transfer is already ${status.toLowerCase()} and can't be changed.`,
    );
  }
}
