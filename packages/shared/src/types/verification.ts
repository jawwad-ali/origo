import type { DosageForm, VerificationReason, VerificationVerdict } from "../enums";

/** Why a scan came back as a warning, in words a patient can act on. */
export interface VerificationReasonDto {
  code: VerificationReason;
  title: string;
  detail: string;
}

/**
 * What a patient sees after scanning a pack. Deliberately minimal: product facts and a plain verdict,
 * never who holds the pack, prices, or anyone's internal IDs.
 */
export interface VerificationDto {
  verdict: VerificationVerdict;
  reasons: VerificationReasonDto[];
  publicId: string;
  /** Null when the code isn't recognized: nothing about an unknown or forged code is revealed. */
  pack: {
    product: {
      name: string;
      genericName: string;
      strength: string;
      dosageForm: DosageForm;
      packSize: string;
      storageInstructions: string;
    };
    manufacturer: { name: string; city: string; country: string };
    batch: { batchNumber: string; manufacturedOn: string; expiresOn: string; recalled: boolean };
    journey: {
      registeredOn: string;
      handovers: number;
      reachedPharmacyOn: string | null;
      dispensedOn: string | null;
    };
    scans: { total: number; firstScannedAt: string | null };
  } | null;
  checkedAt: string;
}

export interface PublicKeyDto {
  keyId: string;
  algorithm: "Ed25519";
  /** SPKI DER, base64. */
  publicKey: string;
}
