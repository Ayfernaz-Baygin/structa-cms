export const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export const AUTH_COOKIE_NAME = 'structa_access_token';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}
