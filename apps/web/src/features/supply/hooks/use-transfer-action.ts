"use client";

import { type TransferDetailDto } from "@origo/shared";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";

/** Runs a transfer action, toasts the result and refreshes the server-rendered page. */
export const useTransferAction = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (request: () => Promise<TransferDetailDto>, success: string, onDone?: () => void): void => {
    startTransition(async () => {
      try {
        const transfer = await request();
        toast.success(success, { description: transfer.reference });
        onDone?.();
        router.refresh();
      } catch (error) {
        toast.error("Couldn't update the transfer", {
          description: error instanceof ApiError ? error.message : "Try again in a moment.",
        });
        router.refresh();
      }
    });
  };

  return { isPending, run };
};
