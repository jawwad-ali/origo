-- CreateTable
CREATE TABLE "label_export_files" (
    "export_id" UUID NOT NULL,
    "data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "label_export_files_pkey" PRIMARY KEY ("export_id")
);

-- AddForeignKey
ALTER TABLE "label_export_files" ADD CONSTRAINT "label_export_files_export_id_fkey" FOREIGN KEY ("export_id") REFERENCES "label_exports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
