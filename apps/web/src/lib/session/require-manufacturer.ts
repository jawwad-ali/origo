import "server-only";
import { type CurrentUserDto } from "@origo/shared";
import { notFound } from "next/navigation";
import { isApprovedManufacturer } from "@/features/shell/nav";
import { getCurrentUser } from "./get-current-user";

/** Catalog pages are for approved manufacturers only; everyone else gets a 404 (the API enforces it too). */
export const requireManufacturer = async (): Promise<CurrentUserDto> => {
  const user = await getCurrentUser();
  if (!isApprovedManufacturer(user)) notFound();
  return user;
};
