import {
  type OrgType,
  type PackStatus,
  type VerificationReason,
  type VerificationVerdict,
} from "@origo/shared";
import { MANY_SCANS_THRESHOLD } from "./constants";

export interface VerificationFacts {
  signatureValid: boolean;
  /** False when the visitor typed the ID instead of scanning (no signature at all). */
  signaturePresent: boolean;
  recalled: boolean;
  expired: boolean;
  packStatus: PackStatus;
  ownerType: OrgType;
  chainIntact: boolean;
  previousScans: number;
  /** Distinct cities seen in recent scans, including this one. */
  recentCities: number;
}

/**
 * Turns what we know about a pack into warnings. Pure and ordered by severity, so the verdict
 * is explainable and easy to change without touching data access.
 */
export const evaluate = (facts: VerificationFacts): VerificationReason[] => {
  const reasons: VerificationReason[] = [];
  if (!facts.signaturePresent) reasons.push("CODE_NOT_SCANNED");
  if (facts.recalled) reasons.push("RECALLED");
  if (!facts.chainIntact) reasons.push("HISTORY_BROKEN");
  if (facts.expired) reasons.push("EXPIRED");
  if (facts.packStatus !== "DISPENSED" && facts.ownerType !== "PHARMACY") reasons.push("NOT_AT_PHARMACY");
  if (facts.previousScans + 1 > MANY_SCANS_THRESHOLD) reasons.push("MANY_SCANS");
  if (facts.recentCities > 1) reasons.push("SCANNED_IN_MANY_PLACES");
  return reasons;
};

export const verdictFor = (signatureValid: boolean, reasons: VerificationReason[]): VerificationVerdict =>
  signatureValid || reasons.includes("CODE_NOT_SCANNED")
    ? reasons.length === 0
      ? "VERIFIED"
      : "WARNING"
    : "NOT_RECOGNIZED";
