"use client";

import { type PackHistoryDto } from "@origo/shared";
import { HandHeart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/api-error";
import { postJson } from "@/lib/api/client-api";
import { API_ROUTES } from "@/lib/api/constants";

const dispense = (publicId: string): Promise<PackHistoryDto> =>
  postJson(`${API_ROUTES.packs}/${encodeURIComponent(publicId)}/dispense`);

/** Pharmacy only: records that this pack left the counter with a patient. Can't be undone. */
export const DispenseButton = ({ publicId }: { publicId: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const confirm = (): void => {
    startTransition(async () => {
      try {
        await dispense(publicId);
        toast.success("Pack dispensed", { description: publicId });
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error("Couldn't dispense this pack", {
          description: error instanceof ApiError ? error.message : "Try again in a moment.",
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button>
          <HandHeart className="size-4" aria-hidden="true" />
          Dispense to patient
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Dispense {publicId}?</AlertDialogTitle>
          <AlertDialogDescription>
            The pack leaves your stock and its history records that a licensed pharmacy sold it. When the
            patient scans it, they&apos;ll see that. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Not yet</AlertDialogCancel>
          <Button onClick={confirm} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Dispense
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
