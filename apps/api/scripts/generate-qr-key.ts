import { generateKeyPairSync } from "node:crypto";

/**
 * Prints a new Ed25519 key pair for signing QR codes.
 *   pnpm --filter @origo/api qr:keygen
 * Put the private key in QR_SIGNING_PRIVATE_KEY (keep it secret). The public key can be published.
 */
const { privateKey, publicKey } = generateKeyPairSync("ed25519");

const privateDer = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");
const publicDer = publicKey.export({ format: "der", type: "spki" }).toString("base64");

process.stdout.write(`QR_SIGNING_PRIVATE_KEY=${privateDer}\n`);
process.stdout.write(`# public key (safe to share): ${publicDer}\n`);
