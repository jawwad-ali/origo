import "server-only";
import { type CurrentUserDto } from "@origo/shared";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError } from "../api/api-error";
import { API_ROUTES } from "../api/constants";
import { serverApi } from "../api/server-api";
import { ROUTES } from "../routes";

/** The signed-in user for this request, fetched once per render. Redirects to login when signed out. */
export const getCurrentUser = cache(async (): Promise<CurrentUserDto> => {
  try {
    return await serverApi<CurrentUserDto>(API_ROUTES.me);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(ROUTES.login);
    throw error;
  }
});
