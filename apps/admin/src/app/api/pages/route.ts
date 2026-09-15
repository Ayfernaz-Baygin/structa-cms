import { NextResponse } from "next/server";

import { API_URL } from "@/lib/api";
import { getAuthToken } from "@/lib/server-api";

export async function GET(request: Request) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
  }

  const response = await fetch(
    `${API_URL}/pages${new URL(request.url).search}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${API_URL}/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
