export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  adminOrganizations: "/admin/organizations",
  products: "/products",
  batches: "/batches",
  inventory: "/inventory",
  transfers: "/transfers",
  newTransfer: "/transfers/new",
} as const;

export const productPath = (id: string): string => `/products/${encodeURIComponent(id)}`;
export const batchPath = (id: string): string => `/batches/${encodeURIComponent(id)}`;
export const transferPath = (id: string): string => `/transfers/${encodeURIComponent(id)}`;
export const packPath = (publicId: string): string => `/packs/${encodeURIComponent(publicId)}`;

/** Pages that need a signed-in user. */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/products",
  "/batches",
  "/inventory",
  "/transfers",
  "/packs",
] as const;

/** Pages a signed-in user shouldn't see (they get sent to the dashboard). */
export const GUEST_ONLY_PREFIXES = ["/login", "/signup"] as const;

export const NEXT_PARAM = "next";

/** Only allow same-site relative paths as a post-login destination. */
export const safeNextPath = (value: string | null | undefined): string =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : ROUTES.dashboard;
