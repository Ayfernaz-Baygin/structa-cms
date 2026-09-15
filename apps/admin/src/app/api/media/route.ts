import { NextResponse } from 'next/server';

import { API_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/server-api';

export async function GET(request: Request) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const { search } = new URL(request.url);

  const response = await fetch(`${API_URL}/media${search}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const formData = await request.formData();

  const response = await fetch(`${API_URL}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
