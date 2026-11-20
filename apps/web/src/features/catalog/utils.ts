import { type ExpiryState } from "./types";

const DAY_MS = 86_400_000;
const EXPIRY_WARNING_DAYS = 90;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const parsePage = (value: string | string[] | undefined): number => {
  const page = Number(first(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const parseSearch = (value: string | string[] | undefined): string | undefined => {
  const term = first(value)?.trim();
  return term ? term.slice(0, 100) : undefined;
};

/** "expired", "soon" (within 90 days) or "ok", for an ISO date string. */
export const expiryState = (isoDate: string, now: Date = new Date()): ExpiryState => {
  const days = (Date.parse(`${isoDate}T00:00:00Z`) - now.getTime()) / DAY_MS;
  if (days < 0) return "expired";
  if (days <= EXPIRY_WARNING_DAYS) return "soon";
  return "ok";
};

/** Builds a URL for the same page with one query parameter changed (and the page reset). */
export const hrefWith = (path: string, params: Record<string, string | number | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
