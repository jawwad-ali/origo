import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, API_PREFIX, API_ROUTES, REFRESH_COOKIE } from "./lib/api/constants";
import { GUEST_ONLY_PREFIXES, NEXT_PARAM, PROTECTED_PREFIXES, ROUTES } from "./lib/routes";

const matches = (pathname: string, prefixes: readonly string[]): boolean =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** "name=value; Path=/; HttpOnly" → ["name", "value"] */
const parseSetCookie = (header: string): [string, string] | null => {
  const pair = header.split(";", 1)[0] ?? "";
  const separator = pair.indexOf("=");
  return separator > 0 ? [pair.slice(0, separator), pair.slice(separator + 1)] : null;
};

/**
 * Exchanges the refresh cookie for a new access token on the server, before the page renders,
 * so Server Components see a valid session and the browser receives the rotated cookies.
 */
const refreshSession = async (request: NextRequest): Promise<NextResponse | null> => {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const apiUrl = process.env.API_URL;
  if (!refreshToken || !apiUrl) return null;

  const response = await fetch(`${apiUrl}${API_PREFIX}${API_ROUTES.refresh}`, {
    method: "POST",
    headers: { Cookie: `${REFRESH_COOKIE}=${refreshToken}` },
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) return null;

  const setCookies = response.headers.getSetCookie();
  for (const header of setCookies) {
    const parsed = parseSetCookie(header);
    if (parsed) request.cookies.set(parsed[0], parsed[1]);
  }

  const next = NextResponse.next({ request: { headers: request.headers } });
  for (const header of setCookies) next.headers.append("set-cookie", header);
  return next;
};

const redirectToLogin = (request: NextRequest): NextResponse => {
  const url = new URL(ROUTES.login, request.url);
  url.searchParams.set(NEXT_PARAM, `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(url);
  response.cookies.delete(ACCESS_COOKIE);
  return response;
};

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
  const { pathname } = request.nextUrl;
  const hasAccess = request.cookies.has(ACCESS_COOKIE);

  if (matches(pathname, GUEST_ONLY_PREFIXES)) {
    return hasAccess ? NextResponse.redirect(new URL(ROUTES.dashboard, request.url)) : NextResponse.next();
  }

  if (pathname === ROUTES.home) {
    const signedIn = hasAccess || request.cookies.has(REFRESH_COOKIE);
    return NextResponse.redirect(new URL(signedIn ? ROUTES.dashboard : ROUTES.login, request.url));
  }

  if (matches(pathname, PROTECTED_PREFIXES) && !hasAccess) {
    return (await refreshSession(request)) ?? redirectToLogin(request);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard/:path*", "/admin/:path*"],
};
