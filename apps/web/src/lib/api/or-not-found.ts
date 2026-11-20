import "server-only";
import { notFound } from "next/navigation";
import { ApiError } from "./api-error";

/** Turns an API 404 (or 403 for someone else's record) into the app's not-found page. */
export const orNotFound = async <T>(request: Promise<T>): Promise<T> => {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }
};
