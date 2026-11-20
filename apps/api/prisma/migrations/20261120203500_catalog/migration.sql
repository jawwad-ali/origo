-- CreateEnum
CREATE TYPE "DosageForm" AS ENUM ('TABLET', 'CAPSULE', 'SYRUP', 'SUSPENSION', 'INJECTION', 'CREAM', 'OINTMENT', 'DROPS', 'INHALER', 'OTHER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'RECALLED');

-- CreateEnum
CREATE TYPE "PackStatus" AS ENUM ('IN_STOCK', 'IN_TRANSIT', 'DISPENSED', 'RECALLED');

-- CreateEnum
CREATE TYPE "LabelExportStatus" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "dosage_form" "DosageForm" NOT NULL,
    "pack_size" TEXT NOT NULL,
    "storage_instructions" TEXT NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "manufactured_on" DATE NOT NULL,
    "expires_on" DATE NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "pack_count" INTEGER NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packs" (
    "id" UUID NOT NULL,
    "public_id" TEXT NOT NULL,
    "serial" INTEGER NOT NULL,
    "batch_id" UUID NOT NULL,
    "current_owner_org_id" UUID NOT NULL,
    "status" "PackStatus" NOT NULL DEFAULT 'IN_STOCK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "label_exports" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "status" "LabelExportStatus" NOT NULL DEFAULT 'QUEUED',
    "label_count" INTEGER NOT NULL,
    "file_path" TEXT,
    "file_size_bytes" INTEGER,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "label_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_organization_id_created_at_idx" ON "products"("organization_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "products_organization_id_name_strength_dosage_form_key" ON "products"("organization_id", "name", "strength", "dosage_form");

-- CreateIndex
CREATE INDEX "batches_product_id_idx" ON "batches"("product_id");

-- CreateIndex
CREATE INDEX "batches_organization_id_created_at_idx" ON "batches"("organization_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "batches_organization_id_batch_number_key" ON "batches"("organization_id", "batch_number");

-- CreateIndex
CREATE UNIQUE INDEX "packs_public_id_key" ON "packs"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "packs_serial_key" ON "packs"("serial");

-- CreateIndex
CREATE INDEX "packs_batch_id_serial_idx" ON "packs"("batch_id", "serial");

-- CreateIndex
CREATE INDEX "packs_current_owner_org_id_status_idx" ON "packs"("current_owner_org_id", "status");

-- CreateIndex
CREATE INDEX "label_exports_batch_id_created_at_idx" ON "label_exports"("batch_id", "created_at");

-- CreateIndex
CREATE INDEX "label_exports_status_expires_at_idx" ON "label_exports"("status", "expires_at");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packs" ADD CONSTRAINT "packs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packs" ADD CONSTRAINT "packs_current_owner_org_id_fkey" FOREIGN KEY ("current_owner_org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_exports" ADD CONSTRAINT "label_exports_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Pack serials come from one sequence so pack IDs are unique across all manufacturers
-- and never reused, even if a registration transaction rolls back.
CREATE SEQUENCE "pack_serial_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO CYCLE;

-- Dates must make sense at the database level too, not only in the API.
ALTER TABLE "batches" ADD CONSTRAINT "batches_expiry_after_manufacture" CHECK ("expires_on" > "manufactured_on");
ALTER TABLE "batches" ADD CONSTRAINT "batches_pack_count_positive" CHECK ("pack_count" > 0);
