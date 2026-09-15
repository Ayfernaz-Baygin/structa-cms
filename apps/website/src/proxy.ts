import { NextRequest, NextResponse } from "next/server";

/** Keep existing page components while exposing a locale-prefixed public URL. */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const match = url.pathname.match(/^\/(tr|en)(?:\/|$)/);
  if (!match) {
    if (/^\/[a-z]{2}(?:\/|$)/.test(url.pathname))
      return new NextResponse(null, { status: 404 });
    url.pathname = `/tr${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.redirect(url);
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-structa-locale", match[1]);
  url.pathname = url.pathname.slice(3) || "/";
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}
export const config = {
  matcher: ["/((?!api|uploads|_next|favicon\\.ico|.*\\..*).*)"],
};
