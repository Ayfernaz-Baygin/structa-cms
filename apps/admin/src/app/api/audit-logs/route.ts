import { NextResponse } from 'next/server';

import { API_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/server-api';

export async function GET(request: Request) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  // Preserve pagination/filters and the API's existing JWT + role checks.
  const { search } = new URL(request.url);
  try {
    const response = await fetch(`${API_URL}/audit-logs${search}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'İşlem geçmişi yüklenemedi.' },
      { status: 502 },
    );
  }
}
