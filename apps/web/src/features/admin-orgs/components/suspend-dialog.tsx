"use client";

import { type OrganizationDto } from "@origo/shared";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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
import { useReviewAction } from "../hooks/use-review-action";
import { suspendOrganization } from "../services/admin-orgs.client";

export const SuspendDialog = ({ org }: { org: OrganizationDto }) => {
  const [open, setOpen] = useState(false);
  const { isPending, run } = useReviewAction();

  const handleConfirm = (): void => {
    run(
      () => suspendOrganization(org.id),
      "Organization suspended",
      () => setOpen(false),
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Suspend
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend {org.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Their team can still sign in, but they can&apos;t record products or transfers until you approve
            them again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Suspend organization
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
