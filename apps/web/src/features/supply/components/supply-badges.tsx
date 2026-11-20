import { type ChainCheckDto, TRANSFER_STATUS_LABELS, type TransferStatus } from "@origo/shared";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { StatusPill } from "@/components/status/status-pill";
import { TRANSFER_STATUS_STYLE } from "../constants";

export const TransferStatusBadge = ({ status }: { status: TransferStatus }) => {
  const style = TRANSFER_STATUS_STYLE[status];
  return (
    <StatusPill tone={style.tone} icon={style.icon}>
      {TRANSFER_STATUS_LABELS[status]}
    </StatusPill>
  );
};

/** The result of re-checking every hash in the pack's history. */
export const ChainBadge = ({ chain }: { chain: ChainCheckDto }) =>
  chain.intact ? (
    <StatusPill tone="success" icon={ShieldCheck}>
      Chain intact · {chain.eventCount} {chain.eventCount === 1 ? "event" : "events"}
    </StatusPill>
  ) : (
    <StatusPill tone="danger" icon={ShieldAlert}>
      Chain broken at event {chain.brokenAtSeq}
    </StatusPill>
  );
