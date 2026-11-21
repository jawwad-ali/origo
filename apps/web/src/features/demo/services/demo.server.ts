import "server-only";
import { type DemoSampleDto } from "@origo/shared";
import { ApiError } from "@/lib/api/api-error";
import { API_PREFIX } from "@/lib/api/constants";

/** Sample packs for the demo page, or null when the API isn't running in demo mode. */
export const getDemoSamples = async (): Promise<DemoSampleDto[] | null> => {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_PREFIX}/demo/samples`, { cache: "no-store" }).catch(
    () => null,
  );
  if (!response) throw ApiError.network();
  if (response.status === 404) return null;
  if (!response.ok) throw await ApiError.fromResponse(response);
  return (await response.json()) as DemoSampleDto[];
};

/** The shared demo password, shown on the demo page only when the deployment opts in. */
export const demoPassword = (): string | null => process.env.DEMO_PASSWORD || null;
