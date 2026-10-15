import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: true,
  alternateLinks: false,
});

const VISITOR_COOKIE = "mc_vid";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365;

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  if (process.env.EVENT_REPORT === "1" && !request.cookies.has(VISITOR_COOKIE)) {
    response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      path: "/",
      maxAge: VISITOR_MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(zh|en)/:path*"],
};
