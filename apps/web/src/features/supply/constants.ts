import { type LedgerEventType, type TransferStatus } from "@origo/shared";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleCheck,
  CircleX,
  Clock,
  type LucideIcon,
  PackagePlus,
  Undo2,
} from "lucide-react";
import { type StatusTone } from "@/components/status/status-pill";

export const INVENTORY_PAGE_SIZE = 20;
export const TRANSFERS_PAGE_SIZE = 20;

export const TRANSFER_STATUS_STYLE: Record<TransferStatus, { tone: StatusTone; icon: LucideIcon }> = {
  PENDING: { tone: "warning", icon: Clock },
  ACCEPTED: { tone: "success", icon: CircleCheck },
  REJECTED: { tone: "danger", icon: CircleX },
  CANCELLED: { tone: "neutral", icon: Undo2 },
};

/** How each ledger event reads on the timeline. */
export const LEDGER_EVENT_STYLE: Record<
  LedgerEventType,
  { icon: LucideIcon; verb: string; tone: StatusTone }
> = {
  REGISTERED: { icon: PackagePlus, verb: "Registered by", tone: "info" },
  TRANSFER_SENT: { icon: ArrowUpFromLine, verb: "Sent by", tone: "info" },
  TRANSFER_RECEIVED: { icon: ArrowDownToLine, verb: "Received by", tone: "success" },
  TRANSFER_REJECTED: { icon: CircleX, verb: "Rejected by", tone: "danger" },
  TRANSFER_CANCELLED: { icon: Undo2, verb: "Cancelled by", tone: "neutral" },
};

/** Characters of a SHA-256 hash shown inline; the full value is in a tooltip. */
export const HASH_PREVIEW_LENGTH = 12;
