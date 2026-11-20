import { createHash } from "node:crypto";
import { type LedgerEventType } from "@origo/shared";

/** prevHash of the first event in every pack's chain. */
export const GENESIS_HASH = "0".repeat(64);

export interface HashableEvent {
  packId: string;
  seq: number;
  type: LedgerEventType;
  actorOrgId: string;
  counterpartyOrgId: string | null;
  transferId: string | null;
  createdAt: Date;
}

/**
 * SHA-256 over the previous hash and the event's fields, in a fixed order with a separator
 * that can't appear in any field. Changing any past event changes its hash and breaks every
 * link after it.
 */
export const hashEvent = (prevHash: string, event: HashableEvent): string =>
  createHash("sha256")
    .update(
      [
        prevHash,
        event.packId,
        String(event.seq),
        event.type,
        event.actorOrgId,
        event.counterpartyOrgId ?? "",
        event.transferId ?? "",
        event.createdAt.toISOString(),
      ].join("|"),
    )
    .digest("hex");
