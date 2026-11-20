import { createHmac } from "node:crypto";
import { Injectable } from "@nestjs/common";
import {
  PACK_ID_PATTERN,
  type PublicKeyDto,
  type VerificationDto,
  type VerificationReason,
} from "@origo/shared";
import { type LedgerEvent } from "@prisma/client";
import { toIsoDate } from "../../common/utils/principal";
import { AppConfigService } from "../../config/app-config.service";
import { LedgerService } from "../ledger/ledger.service";
import { QrSigningService } from "../qr-signing/qr-signing.service";
import { REASON_COPY, SPREAD_WINDOW_HOURS } from "./constants";
import { evaluate, verdictFor } from "./verification-rules";
import { type PackForVerification, VerificationRepository } from "./verification.repository";

export interface VerifyRequest {
  publicId: string;
  keyId: string | undefined;
  signature: string | undefined;
}

export interface ScanClient {
  ip: string | null;
  city: string | null;
  country: string | null;
}

const HOUR_MS = 3_600_000;

/** Public verification: signature check, pack facts, warning rules, and a privacy-preserving scan log. */
@Injectable()
export class VerificationService {
  constructor(
    private readonly repo: VerificationRepository,
    private readonly ledger: LedgerService,
    private readonly qr: QrSigningService,
    private readonly config: AppConfigService,
  ) {}

  async verify(request: VerifyRequest, client: ScanClient): Promise<VerificationDto> {
    const publicId = request.publicId.trim().toUpperCase();
    const checkedAt = new Date().toISOString();
    const notRecognized: VerificationDto = {
      verdict: "NOT_RECOGNIZED",
      reasons: [],
      publicId,
      pack: null,
      checkedAt,
    };
    if (!PACK_ID_PATTERN.test(publicId)) return notRecognized;

    const signaturePresent = Boolean(request.keyId && request.signature);
    const signatureValid =
      signaturePresent && this.qr.isAuthentic(publicId, request.keyId ?? "", request.signature ?? "");
    const pack = await this.repo.findPack(publicId);
    if (!pack) return notRecognized;
    if (signaturePresent && !signatureValid) {
      // A forged code for a real pack ID is worth logging; nothing about the pack is revealed.
      await this.record(pack.id, "NOT_RECOGNIZED", false, client);
      return notRecognized;
    }

    const events = await this.ledger.history(pack.id);
    const stats = await this.repo.scanStats(pack.id, new Date(Date.now() - SPREAD_WINDOW_HOURS * HOUR_MS));
    const cities = new Set(stats.recentCities);
    if (client.city && signaturePresent) cities.add(client.city);

    const reasons = evaluate({
      signatureValid,
      signaturePresent,
      recalled: pack.batch.status === "RECALLED",
      expired: pack.batch.expiresOn < new Date(new Date().toISOString().slice(0, 10)),
      packStatus: pack.status,
      ownerType: pack.currentOwner.type,
      chainIntact: this.ledger.verify(events).intact,
      previousScans: stats.total,
      recentCities: cities.size,
    });
    const verdict = verdictFor(signatureValid, reasons);
    // Only real scans count; a typed-in ID proves nothing about the physical label.
    if (signaturePresent) await this.record(pack.id, verdict, true, client);

    return {
      verdict,
      reasons: reasons.map((code) => this.reason(code)),
      publicId,
      pack: await this.packView(pack, events, {
        total: stats.total + (signaturePresent ? 1 : 0),
        first: stats.first ?? (signaturePresent ? new Date(checkedAt) : null),
      }),
      checkedAt,
    };
  }

  publicKeys(): PublicKeyDto[] {
    return [
      {
        keyId: this.config.get("QR_SIGNING_KEY_ID"),
        algorithm: "Ed25519",
        publicKey: this.qr.publicKeyBase64(),
      },
    ];
  }

  private reason(code: VerificationReason) {
    return { code, ...REASON_COPY[code] };
  }

  private async packView(
    pack: PackForVerification,
    events: LedgerEvent[],
    scans: { total: number; first: Date | null },
  ): Promise<NonNullable<VerificationDto["pack"]>> {
    const received = events.filter((event) => event.type === "TRANSFER_RECEIVED");
    const types = await this.repo.orgTypes([...new Set(received.map((event) => event.actorOrgId))]);
    const reachedPharmacy = received.find((event) => types.get(event.actorOrgId) === "PHARMACY");
    const dispensed = events.find((event) => event.type === "DISPENSED");
    const { batch } = pack;

    return {
      product: batch.product,
      manufacturer: batch.organization,
      batch: {
        batchNumber: batch.batchNumber,
        manufacturedOn: toIsoDate(batch.manufacturedOn),
        expiresOn: toIsoDate(batch.expiresOn),
        recalled: batch.status === "RECALLED",
      },
      journey: {
        registeredOn: (events[0]?.createdAt ?? pack.createdAt).toISOString(),
        handovers: received.length,
        reachedPharmacyOn: reachedPharmacy?.createdAt.toISOString() ?? null,
        dispensedOn: dispensed?.createdAt.toISOString() ?? null,
      },
      scans: { total: scans.total, firstScannedAt: scans.first?.toISOString() ?? null },
    };
  }

  private async record(
    packId: string,
    verdict: VerificationDto["verdict"],
    signatureValid: boolean,
    client: ScanClient,
  ): Promise<void> {
    const deviceHash = client.ip
      ? createHmac("sha256", this.config.get("SCAN_HASH_SECRET")).update(client.ip).digest("hex")
      : null;
    await this.repo.recordScan({
      packId,
      verdict,
      signatureValid,
      deviceHash,
      city: client.city,
      country: client.country,
    });
  }
}
