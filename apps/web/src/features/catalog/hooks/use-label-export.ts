"use client";

import { type LabelExportDto } from "@origo/shared";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";
import { EXPORT_POLL_MS } from "../constants";
import { getLabelExport, requestLabelExport } from "../services/catalog.client";

const isBuilding = (item: LabelExportDto | null): boolean =>
  item?.status === "QUEUED" || item?.status === "PROCESSING";

/** Requests a label export and polls it until the PDF is ready or the build fails. */
export const useLabelExport = (batchId: string, initial: LabelExportDto | null) => {
  const [current, setCurrent] = useState<LabelExportDto | null>(initial);
  const [isRequesting, startRequest] = useTransition();

  useEffect(() => {
    if (!current || !isBuilding(current)) return;
    const timer = setInterval(() => {
      getLabelExport(current.id)
        .then((next) => {
          setCurrent(next);
          if (next.status === "READY")
            toast.success("Labels are ready", { description: "Your PDF can be downloaded." });
          if (next.status === "FAILED")
            toast.error("Labels couldn't be built", { description: next.error ?? undefined });
        })
        .catch(() => {
          // A missed poll is retried on the next tick; nothing to show the user yet.
        });
    }, EXPORT_POLL_MS);
    return () => clearInterval(timer);
  }, [current]);

  const request = useCallback(() => {
    startRequest(async () => {
      try {
        setCurrent(await requestLabelExport(batchId));
      } catch (error) {
        toast.error("Couldn't start the export", {
          description: error instanceof ApiError ? error.message : "Try again in a moment.",
        });
      }
    });
  }, [batchId]);

  return { current, isBuilding: isBuilding(current), isRequesting, request };
};
