import "server-only";
import { cookies } from "next/headers";
import { ApiError } from "./api-error";
import { API_PREFIX } from "./constants";

const apiBaseUrl = (): string => {
  const url = process.env.API_URL;
  if (!url) throw new Error("API_URL is not set");
  return url;
};

/**
 * Calls the API from a Server Component, forwarding the visitor's cookies.
 * Never cached: every response depends on who is asking.
 */
export const serverApi = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const cookieHeader = (await cookies()).toString();
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${API_PREFIX}${path}`, {
      ...init,
      cache: "no-store",
      headers: { Accept: "application/json", Cookie: cookieHeader, ...init.headers },
    });
  } catch {
    throw ApiError.network();
  }
  if (!response.ok) throw await ApiError.fromResponse(response);
  return (await response.json()) as T;
};
