export const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export const AUTH_COOKIE_NAME = 'structa_access_token';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export type PageStatus = 'DRAFT' | 'PUBLISHED';

export interface Page {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  status: PageStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export type ServiceStatus = 'DRAFT' | 'PUBLISHED';

export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  icon: string | null;
  coverImage: string | null;
  status: ServiceStatus;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
