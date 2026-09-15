import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAME } from './api';

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}
