-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LedgerEventType" AS ENUM ('REGISTERED', 'TRANSFER_SENT', 'TRANSFER_RECEIVED', 'TRANSFER_REJECTED', 'TRANSFER_CANCELLED');

-- CreateTable
CREATE TABLE "transfers" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "from_org_id" UUID NOT NULL,
    "to_org_id" UUID NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "pack_count" INTEGER NOT NULL,
    "note" TEXT,
    "rejection_reason" TEXT,
    "idempotency_key" TEXT,
    "created_by_id" UUID NOT NULL,
    "responded_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_items" (
    "id" UUID NOT NULL,
    "transfer_id" UUID NOT NULL,
    "pack_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_events" (
    "id" UUID NOT NULL,
    "pack_id" UUID NOT NULL,
    "seq" INTEGER NOT NULL,
    "type" "LedgerEventType" NOT NULL,
    "actor_org_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "counterparty_org_id" UUID,
    "transfer_id" UUID,
    "prev_hash" CHAR(64) NOT NULL,
    "hash" CHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ledger_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transfers_reference_key" ON "transfers"("reference");

-- CreateIndex
CREATE INDEX "transfers_from_org_id_status_created_at_idx" ON "transfers"("from_org_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "transfers_to_org_id_status_created_at_idx" ON "transfers"("to_org_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_from_org_id_idempotency_key_key" ON "transfers"("from_org_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "transfer_items_pack_id_idx" ON "transfer_items"("pack_id");

-- CreateIndex
CREATE INDEX "transfer_items_transfer_id_batch_id_idx" ON "transfer_items"("transfer_id", "batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_items_transfer_id_pack_id_key" ON "transfer_items"("transfer_id", "pack_id");

-- CreateIndex
CREATE INDEX "ledger_events_transfer_id_idx" ON "ledger_events"("transfer_id");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_events_pack_id_seq_key" ON "ledger_events"("pack_id", "seq");

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_org_id_fkey" FOREIGN KEY ("from_org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_org_id_fkey" FOREIGN KEY ("to_org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_items" ADD CONSTRAINT "transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_items" ADD CONSTRAINT "transfer_items_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_events" ADD CONSTRAINT "ledger_events_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- A pack may be in at most one open (pending) transfer at a time.
CREATE UNIQUE INDEX "transfer_items_one_open_transfer_per_pack"
  ON "transfer_items" ("pack_id") WHERE "is_open";

-- Human-readable transfer references (TRF-2026-000001), unique across the platform.
CREATE SEQUENCE "transfer_ref_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO CYCLE;

ALTER TABLE "transfers" ADD CONSTRAINT "transfers_not_to_self" CHECK ("from_org_id" <> "to_org_id");
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_pack_count_positive" CHECK ("pack_count" > 0);
ALTER TABLE "ledger_events" ADD CONSTRAINT "ledger_events_seq_positive" CHECK ("seq" > 0);

-- The ledger is append-only: history can be added to, never edited or removed.
CREATE FUNCTION "ledger_events_reject_change"() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'ledger_events is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

CREATE TRIGGER "ledger_events_no_update_or_delete"
  BEFORE UPDATE OR DELETE ON "ledger_events"
  FOR EACH ROW EXECUTE FUNCTION "ledger_events_reject_change"();

CREATE TRIGGER "ledger_events_no_truncate"
  BEFORE TRUNCATE ON "ledger_events"
  FOR EACH STATEMENT EXECUTE FUNCTION "ledger_events_reject_change"();
