import { NextRequest, NextResponse } from 'next/server';

import { API_URL, AUTH_COOKIE_NAME, type AuthUser } from '@/lib/api';

const PUBLIC_ONLY_PATHS = new Set(['/login']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await fetchUser(token) : null;

  const isPublicOnlyPath = PUBLIC_ONLY_PATHS.has(pathname);

  if (!user) {
    if (isPublicOnlyPath) {
      return withClearedCookie(NextResponse.next(), token);
    }

    const loginUrl = new URL('/login', request.url);
    return withClearedCookie(NextResponse.redirect(loginUrl), token);
  }

  if (isPublicOnlyPath || pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-structa-user', JSON.stringify(user));

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

async function fetchUser(token: string): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuthUser;
  } catch {
    return null;
  }
}

function withClearedCookie(response: NextResponse, token: string | undefined) {
  if (token) {
    response.cookies.delete(AUTH_COOKIE_NAME);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
};
