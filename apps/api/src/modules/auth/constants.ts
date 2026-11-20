export const ACCESS_COOKIE = "origo_at";
export const REFRESH_COOKIE = "origo_rt";

/**
 * The web app's middleware refreshes the session before rendering a page, so it must see
 * the refresh cookie on page requests. It stays httpOnly, SameSite=Lax and first-party.
 */
export const REFRESH_COOKIE_PATH = "/";

/** Bytes of randomness in a refresh token. */
export const REFRESH_TOKEN_BYTES = 48;

/**
 * A just-rotated refresh token is still accepted for this long, so two tabs (or two
 * parallel requests) refreshing at the same moment don't log the user out.
 */
export const ROTATION_GRACE_SECONDS = 10;

const MINUTE_MS = 60_000;

export const AUTH_THROTTLE = {
  login: { default: { limit: 5, ttl: MINUTE_MS } },
  signup: { default: { limit: 5, ttl: 10 * MINUTE_MS } },
  refresh: { default: { limit: 30, ttl: MINUTE_MS } },
} as const;
