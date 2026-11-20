"use client";

import { type LabelExportDto } from "@origo/shared";
import { AlertCircle, Download, FileText, Loader2, Printer, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { useLabelExport } from "../hooks/use-label-export";
import { labelExportFileUrl } from "../services/catalog.client";
import { formatBytes } from "../utils";

const LABELS_PER_SHEET = 21;

interface LabelExportPanelProps {
  batchId: string;
  packCount: number;
  initial: LabelExportDto | null;
}

/** A finished export whose file hasn't expired yet. */
const isUsable = (item: LabelExportDto | null): boolean =>
  item?.status === "READY" && (!item.expiresAt || Date.parse(item.expiresAt) > Date.now());

const hoursLeft = (iso: string): number =>
  Math.max(1, Math.round((Date.parse(iso) - Date.now()) / 3_600_000));

export const LabelExportPanel = ({ batchId, packCount, initial }: LabelExportPanelProps) => {
  const { current, isBuilding, isRequesting, request } = useLabelExport(batchId, initial);
  const sheets = Math.ceil(packCount / LABELS_PER_SHEET);

  if (isBuilding) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-4" aria-live="polite">
        <Loader2 className="text-primary size-5 animate-spin" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-medium">Building your PDF…</p>
          <p className="text-muted-foreground">
            {formatNumber(packCount)} labels on {formatNumber(sheets)} sheets. You can leave this page; it
            keeps going.
          </p>
        </div>
      </div>
    );
  }

  if (current && isUsable(current)) {
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <FileText className="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 text-sm">
            <p className="font-medium">Labels ready</p>
            <p className="tabular text-muted-foreground">
              {formatNumber(current.labelCount)} labels
              {current.fileSizeBytes ? ` · ${formatBytes(current.fileSizeBytes)}` : ""}
              {current.expiresAt ? ` · available for ${hoursLeft(current.expiresAt)} h` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href={labelExportFileUrl(current.id)} download>
              <Download className="size-4" aria-hidden="true" />
              Download PDF
            </a>
          </Button>
          <Button variant="outline" onClick={request} disabled={isRequesting}>
            <RotateCw className="size-4" aria-hidden="true" />
            Build again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      {current?.status === "FAILED" ? (
        <p role="alert" className="text-destructive flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {current.error ?? "The last export failed."}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          A print-ready A4 PDF with one signed QR label per pack: {formatNumber(packCount)} labels on{" "}
          {formatNumber(sheets)} {sheets === 1 ? "sheet" : "sheets"}.
          {current?.status === "READY" ? " The previous file has expired." : ""}
        </p>
      )}
      <Button onClick={request} disabled={isRequesting}>
        {isRequesting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Printer className="size-4" aria-hidden="true" />
        )}
        {current?.status === "FAILED" ? "Try again" : "Export QR labels"}
      </Button>
    </div>
  );
};
