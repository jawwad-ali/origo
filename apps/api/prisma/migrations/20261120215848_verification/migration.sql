-- CreateEnum
CREATE TYPE "VerificationVerdict" AS ENUM ('VERIFIED', 'WARNING', 'NOT_RECOGNIZED');

-- AlterEnum
ALTER TYPE "LedgerEventType" ADD VALUE 'DISPENSED';

-- CreateTable
CREATE TABLE "scans" (
    "id" UUID NOT NULL,
    "pack_id" UUID NOT NULL,
    "verdict" "VerificationVerdict" NOT NULL,
    "signature_valid" BOOLEAN NOT NULL,
    "device_hash" CHAR(64),
    "city" TEXT,
    "country" CHAR(2),
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scans_pack_id_scanned_at_idx" ON "scans"("pack_id", "scanned_at");

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
