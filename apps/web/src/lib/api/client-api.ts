import { ApiError } from "./api-error";
import { API_PREFIX, API_ROUTES } from "./constants";

const NO_CONTENT = 204;

const send = (path: string, init: RequestInit): Promise<Response> =>
  fetch(`${API_PREFIX}${path}`, {
    ...init,
    credentials: "same-origin",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...init.headers },
  });

const tryRefresh = async (): Promise<boolean> => {
  const response = await send(API_ROUTES.refresh, { method: "POST" }).catch(() => null);
  return response?.ok ?? false;
};

/**
 * Calls the API from the browser through the same-origin proxy.
 * On a 401 it refreshes the session once and retries.
 */
export const clientApi = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  let response = await send(path, init).catch(() => null);
  if (response?.status === 401 && path !== API_ROUTES.refresh && (await tryRefresh())) {
    response = await send(path, init).catch(() => null);
  }
  if (!response) throw ApiError.network();
  if (!response.ok) throw await ApiError.fromResponse(response);
  if (response.status === NO_CONTENT) return undefined as T;
  return (await response.json()) as T;
};

export const postJson = <T>(path: string, body?: unknown): Promise<T> =>
  clientApi<T>(path, { method: "POST", ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
