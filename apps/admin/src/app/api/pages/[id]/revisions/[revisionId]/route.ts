import { NextResponse } from 'next/server';

import { API_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/server-api';

interface RouteParams {
  params: Promise<{ id: string; revisionId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id, revisionId } = await params;
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/pages/${id}/revisions/${revisionId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
