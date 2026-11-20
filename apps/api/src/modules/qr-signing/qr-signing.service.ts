import { createPrivateKey, createPublicKey, type KeyObject, sign, verify } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { AppConfigService } from "../../config/app-config.service";

/** Query parameters carried by every QR URL: key ID and signature. */
export const QR_PARAM_KEY = "k";
export const QR_PARAM_SIGNATURE = "s";

/**
 * Signs pack IDs with Ed25519 so a QR code can't be guessed or edited.
 * The signed message is "<keyId>.<publicId>", so a signature can't be replayed under another key.
 * Ed25519 is deterministic: the same pack always gets the same QR, with nothing to store.
 */
@Injectable()
export class QrSigningService {
  private readonly keyId: string;
  private readonly privateKey: KeyObject;
  private readonly publicKey: KeyObject;
  private readonly verifyBaseUrl: string;

  constructor(config: AppConfigService) {
    this.keyId = config.get("QR_SIGNING_KEY_ID");
    this.privateKey = createPrivateKey({
      key: Buffer.from(config.get("QR_SIGNING_PRIVATE_KEY"), "base64"),
      format: "der",
      type: "pkcs8",
    });
    this.publicKey = createPublicKey(this.privateKey);
    this.verifyBaseUrl = config.get("VERIFY_BASE_URL").replace(/\/+$/, "");
  }

  sign(publicId: string): string {
    return sign(null, this.message(this.keyId, publicId), this.privateKey).toString("base64url");
  }

  /** The URL encoded into the pack's QR code. */
  verifyUrlFor(publicId: string): string {
    const params = new URLSearchParams({
      [QR_PARAM_KEY]: this.keyId,
      [QR_PARAM_SIGNATURE]: this.sign(publicId),
    });
    return `${this.verifyBaseUrl}/${encodeURIComponent(publicId)}?${params.toString()}`;
  }

  /** True when the signature was made by our key for this exact pack ID. */
  isAuthentic(publicId: string, keyId: string, signature: string): boolean {
    if (keyId !== this.keyId) return false;
    try {
      return verify(null, this.message(keyId, publicId), this.publicKey, Buffer.from(signature, "base64url"));
    } catch {
      return false;
    }
  }

  /** The public key (SPKI DER, base64), safe to publish for offline verification. */
  publicKeyBase64(): string {
    return this.publicKey.export({ format: "der", type: "spki" }).toString("base64");
  }

  private message(keyId: string, publicId: string): Buffer {
    return Buffer.from(`${keyId}.${publicId}`, "utf8");
  }
}
