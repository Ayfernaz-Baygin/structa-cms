import { NextResponse } from 'next/server';

import { API_URL, AUTH_COOKIE_NAME } from '@/lib/api';

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, {
      status: response.status,
    });
  }

  const result = NextResponse.json({
    user: data.user,
  });

  result.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: data.accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  return result;
}