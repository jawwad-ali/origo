import "server-only";
import { type CurrentUserDto } from "@origo/shared";
import { notFound } from "next/navigation";
import { isApprovedMember } from "@/features/shell/nav";
import { getCurrentUser } from "./get-current-user";

/** Supply-chain pages need an approved organization; others get a 404 (the API enforces it too). */
export const requireMember = async (): Promise<CurrentUserDto> => {
  const user = await getCurrentUser();
  if (!isApprovedMember(user)) notFound();
  return user;
};
