import { NextResponse } from 'next/server';

import { API_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/server-api';

interface RouteParams {
  params: Promise<{ id: string; imageId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id, imageId } = await params;
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/projects/${id}/images/${imageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
