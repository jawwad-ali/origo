import { type VerificationVerdict } from "@origo/shared";
import { type LucideIcon, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

export interface VerdictCopy {
  icon: LucideIcon;
  title: string;
  summary: string;
  /** Classes for the verdict panel; status colors only, never the brand accent. */
  panel: string;
  iconWrap: string;
}

export const VERDICT_COPY: Record<VerificationVerdict, VerdictCopy> = {
  VERIFIED: {
    icon: ShieldCheck,
    title: "Genuine medicine",
    summary: "This pack is registered by its manufacturer and its handovers are on record.",
    panel: "bg-success-soft border-success/30",
    iconWrap: "bg-success text-white dark:text-[#06200f]",
  },
  WARNING: {
    icon: ShieldAlert,
    title: "Check before you use it",
    summary: "This pack is registered, but something needs your attention.",
    panel: "bg-warning-soft border-warning/40",
    iconWrap: "bg-warning text-white dark:text-[#2a1d02]",
  },
  NOT_RECOGNIZED: {
    icon: ShieldQuestion,
    title: "We can't confirm this pack",
    summary:
      "This code doesn't match a medicine registered on Origo. Don't take it until a pharmacist has checked it.",
    panel: "bg-destructive-soft border-destructive/30",
    iconWrap: "bg-destructive text-white dark:text-[#2a0a0b]",
  },
};
