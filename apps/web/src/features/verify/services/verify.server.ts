import "server-only";
import { type VerificationDto } from "@origo/shared";
import { headers } from "next/headers";
import { ApiError } from "@/lib/api/api-error";
import { API_PREFIX } from "@/lib/api/constants";

/** Vercel sets these on every request; elsewhere they're simply absent. */
const VERCEL_GEO = { city: "x-vercel-ip-city", country: "x-vercel-ip-country" } as const;
const ORIGO_GEO = {
  secret: "x-origo-proxy-secret",
  city: "x-origo-geo-city",
  country: "x-origo-geo-country",
};

/** The visitor's IP as our edge saw it, so the API's rate limit and scan log see the patient, not us. */
const clientIp = (incoming: Headers): string | null =>
  incoming.get("x-real-ip") ?? incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

/**
 * Asks the API to verify a pack. Location is forwarded only with the shared proxy secret,
 * which the API requires before it trusts it.
 */
export const verifyPack = async (
  publicId: string,
  keyId: string | undefined,
  signature: string | undefined,
): Promise<VerificationDto> => {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const incoming = await headers();
  const forward: Record<string, string> = { Accept: "application/json" };
  const ip = clientIp(incoming);
  if (ip) forward["X-Forwarded-For"] = ip;
  const secret = process.env.WEB_PROXY_SECRET;
  const city = incoming.get(VERCEL_GEO.city);
  const country = incoming.get(VERCEL_GEO.country);
  if (secret && (city || country)) {
    forward[ORIGO_GEO.secret] = secret;
    if (city) forward[ORIGO_GEO.city] = city;
    if (country) forward[ORIGO_GEO.country] = country;
  }

  const query = new URLSearchParams();
  if (keyId) query.set("k", keyId);
  if (signature) query.set("s", signature);
  const qs = query.toString();
  let response: Response;
  try {
    response = await fetch(
      `${apiUrl}${API_PREFIX}/verify/${encodeURIComponent(publicId)}${qs ? `?${qs}` : ""}`,
      {
        cache: "no-store",
        headers: forward,
      },
    );
  } catch {
    throw ApiError.network();
  }
  if (!response.ok) throw await ApiError.fromResponse(response);
  return (await response.json()) as VerificationDto;
};
