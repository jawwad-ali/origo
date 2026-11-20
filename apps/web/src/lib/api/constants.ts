export const API_PREFIX = "/api/v1";

export const ACCESS_COOKIE = "origo_at";
export const REFRESH_COOKIE = "origo_rt";

export const API_ROUTES = {
  login: "/auth/login",
  signup: "/auth/signup",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  me: "/auth/me",
  adminOrganizations: "/admin/organizations",
  products: "/products",
  batches: "/batches",
  labelExports: "/label-exports",
  inventory: "/inventory",
  transfers: "/transfers",
  packs: "/packs",
} as const;
