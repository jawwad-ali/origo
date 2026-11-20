"use client";

import { REJECTION_REASON_MAX_LENGTH, type TransferDetailDto } from "@origo/shared";
import { Check, Loader2, Undo2, X } from "lucide-react";
import { useId, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNumber } from "@/lib/format";
import { useTransferAction } from "../hooks/use-transfer-action";
import { acceptTransfer, cancelTransfer, rejectTransfer } from "../services/supply.client";

const MIN_REASON = 5;

const RejectDialog = ({ transfer }: { transfer: TransferDetailDto }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const id = useId();
  const { isPending, run } = useTransferAction();
  const trimmed = reason.trim();

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (trimmed.length < MIN_REASON) return;
    run(
      () => rejectTransfer(transfer.id, trimmed),
      "Transfer rejected",
      () => setOpen(false),
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <X className="size-4" aria-hidden="true" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Reject {transfer.reference}?</DialogTitle>
            <DialogDescription>
              The {formatNumber(transfer.packCount)} packs go back to {transfer.from.name}. They see your
              reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={id}>Reason</Label>
            <Textarea
              id={id}
              rows={3}
              value={reason}
              maxLength={REJECTION_REASON_MAX_LENGTH}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Seals on two cartons were broken."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Keep it pending
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending || trimmed.length < MIN_REASON}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Reject transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CancelDialog = ({ transfer }: { transfer: TransferDetailDto }) => {
  const [open, setOpen] = useState(false);
  const { isPending, run } = useTransferAction();
  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Undo2 className="size-4" aria-hidden="true" />
          Cancel transfer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel {transfer.reference}?</AlertDialogTitle>
          <AlertDialogDescription>
            The {formatNumber(transfer.packCount)} packs come back into your stock and {transfer.to.name} can
            no longer accept them. The cancellation stays in each pack&apos;s history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep it</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              run(
                () => cancelTransfer(transfer.id),
                "Transfer cancelled",
                () => setOpen(false),
              )
            }
          >
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Cancel transfer
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/** The actions the API says the caller may take on this transfer right now. */
export const TransferActions = ({ transfer }: { transfer: TransferDetailDto }) => {
  const { isPending, run } = useTransferAction();
  const { actions } = transfer;
  if (!actions.accept && !actions.reject && !actions.cancel) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.cancel ? <CancelDialog transfer={transfer} /> : null}
      {actions.reject ? <RejectDialog transfer={transfer} /> : null}
      {actions.accept ? (
        <Button disabled={isPending} onClick={() => run(() => acceptTransfer(transfer.id), "Stock received")}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          Accept {formatNumber(transfer.packCount)} packs
        </Button>
      ) : null}
    </div>
  );
};
