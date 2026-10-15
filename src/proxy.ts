import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { GROUP_COOKIE, GROUP_MAX_AGE, VISITOR_COOKIE, VISITOR_MAX_AGE } from "./config/group";
import { routing } from "./i18n/routing";
import { split } from "./lib/split";

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: true,
  alternateLinks: false,
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  let response = intlMiddleware(request);
  const secure = process.env.NODE_ENV === "production";

  let visitor = request.cookies.get(VISITOR_COOKIE)?.value;
  const issueVisitor = process.env.EVENT_REPORT === "1" && !visitor;
  if (issueVisitor) visitor = crypto.randomUUID();

  if (response.ok) {
    const target = new URL(response.headers.get("x-middleware-rewrite") ?? request.url);
    const [, locale, ...rest] = target.pathname.split("/");
    if (rest[0]) {
      const { segment, cookie, session } = split(request, event, visitor);
      target.pathname = `/${locale}/${segment}/${rest.join("/")}`;
      response = NextResponse.rewrite(target, { headers: response.headers });
      if (cookie !== request.cookies.get(GROUP_COOKIE)?.value) {
        response.cookies.set(GROUP_COOKIE, cookie ?? "", {
          path: "/",
          sameSite: "lax",
          secure,
          ...(cookie ? (session ? {} : { maxAge: GROUP_MAX_AGE }) : { maxAge: 0 }),
        });
      }
    }
  }

  if (issueVisitor && visitor) {
    response.cookies.set(VISITOR_COOKIE, visitor, {
      path: "/",
      maxAge: VISITOR_MAX_AGE,
      sameSite: "lax",
      secure,
    });
  }
  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(zh|en)/:path*"],
};
