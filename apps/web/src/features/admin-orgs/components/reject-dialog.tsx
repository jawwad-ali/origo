"use client";

import { REJECTION_REASON_MAX_LENGTH, type OrganizationDto } from "@origo/shared";
import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
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
import { useReviewAction } from "../hooks/use-review-action";
import { rejectOrganization } from "../services/admin-orgs.client";

const MIN_REASON_LENGTH = 5;

export const RejectDialog = ({ org }: { org: OrganizationDto }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const reasonId = useId();
  const { isPending, run } = useReviewAction();
  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= MIN_REASON_LENGTH && !isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) return;
    run(
      () => rejectOrganization(org.id, trimmed),
      "Registration rejected",
      () => {
        setOpen(false);
        setReason("");
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Reject {org.name}?</DialogTitle>
            <DialogDescription>
              The applicant sees this reason on their dashboard. You can approve them later if they fix it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={reasonId}>Reason</Label>
            <Textarea
              id={reasonId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={REJECTION_REASON_MAX_LENGTH}
              rows={4}
              placeholder="e.g. The license number doesn't match the regulator's register."
            />
            <p className="tabular text-muted-foreground text-right text-xs">
              {reason.length}/{REJECTION_REASON_MAX_LENGTH}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!canSubmit}>
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Reject registration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
