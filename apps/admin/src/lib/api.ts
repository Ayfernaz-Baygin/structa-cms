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

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectImage {
  id: string;
  projectId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
}

export type ProjectStatus = 'DRAFT' | 'PUBLISHED';

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  clientName: string | null;
  location: string | null;
  projectDate: string | null;
  coverImage: string | null;
  status: ProjectStatus;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string | null;
  category: ProjectCategory | null;
  images: ProjectImage[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostAuthor {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  status: PostStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string | null;
  category: PostCategory | null;
  authorId: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
