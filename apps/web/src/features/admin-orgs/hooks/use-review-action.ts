"use client";

import { type OrganizationDto } from "@origo/shared";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";

/** Runs a review request, toasts the outcome and refreshes the server-rendered list. */
export const useReviewAction = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (
    request: () => Promise<OrganizationDto>,
    successMessage: string,
    onDone?: () => void,
  ): void => {
    startTransition(async () => {
      try {
        const org = await request();
        toast.success(successMessage, { description: org.name });
        onDone?.();
        router.refresh();
      } catch (error) {
        toast.error("Couldn't update the organization", {
          description: error instanceof ApiError ? error.message : "Try again in a moment.",
        });
      }
    });
  };

  return { isPending, run };
};
