import { BATCH_STATUS_LABELS, type BatchStatus, PACK_STATUS_LABELS, type PackStatus } from "@origo/shared";
import {
  CalendarClock,
  CalendarX,
  CircleCheck,
  OctagonAlert,
  PackageCheck,
  Truck,
  UserCheck,
} from "lucide-react";
import { StatusPill } from "@/components/status/status-pill";
import { formatDate } from "@/lib/format";
import { expiryState } from "../utils";

export const BatchStatusBadge = ({ status }: { status: BatchStatus }) =>
  status === "RECALLED" ? (
    <StatusPill tone="danger" icon={OctagonAlert}>
      {BATCH_STATUS_LABELS.RECALLED}
    </StatusPill>
  ) : (
    <StatusPill tone="success" icon={CircleCheck}>
      {BATCH_STATUS_LABELS.ACTIVE}
    </StatusPill>
  );

const PACK_STATUS_STYLE = {
  IN_STOCK: { tone: "neutral", icon: PackageCheck },
  IN_TRANSIT: { tone: "info", icon: Truck },
  DISPENSED: { tone: "success", icon: UserCheck },
  RECALLED: { tone: "danger", icon: OctagonAlert },
} as const;

export const PackStatusBadge = ({ status }: { status: PackStatus }) => {
  const style = PACK_STATUS_STYLE[status];
  return (
    <StatusPill tone={style.tone} icon={style.icon}>
      {PACK_STATUS_LABELS[status]}
    </StatusPill>
  );
};

/** The expiry date, flagged when it has passed or is within 90 days. */
export const ExpiryDate = ({ isoDate }: { isoDate: string }) => {
  const state = expiryState(isoDate);
  const label = formatDate(`${isoDate}T00:00:00Z`);
  if (state === "expired") {
    return (
      <StatusPill tone="danger" icon={CalendarX}>
        Expired {label}
      </StatusPill>
    );
  }
  if (state === "soon") {
    return (
      <StatusPill tone="warning" icon={CalendarClock}>
        {label}
      </StatusPill>
    );
  }
  return <span className="tabular">{label}</span>;
};
