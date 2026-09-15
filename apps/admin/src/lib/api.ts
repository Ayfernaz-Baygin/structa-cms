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

export interface MediaUploader {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface Media {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  extension: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  title: string | null;
  path: string;
  url: string;
  uploadedById: string;
  uploadedBy: MediaUploader;
  createdAt: string;
  updatedAt: string;
}

export interface MediaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MediaListResponse {
  items: Media[];
  pagination: MediaPagination;
}

export function getMediaUrl(media: Pick<Media, 'url'>): string {
  return `${API_URL}${media.url}`;
}

/**
 * Image/document fields store a raw URL that can be absolute (external) or
 * backend-relative (e.g. "/uploads/images/x.jpg") — this resolves either to
 * something browsable for previews, without touching the stored value itself.
 */
export function resolveFieldImageUrl(url: string | null | undefined): string | null {
  if (!url || url.trim().length === 0) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export interface SiteSettings {
  id: string;
  siteName: string | null;
  siteDescription: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  xUrl: string | null;
  footerText: string | null;
  googleMapsUrl: string | null;
  googleAnalyticsId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MenuLocation = 'HEADER' | 'FOOTER';
export type MenuItemTarget = 'SELF' | 'BLANK';

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  target: MenuItemTarget;
  sortOrder: number;
  menuId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemWithChildren extends MenuItem {
  children: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  location: MenuLocation;
  items: MenuItemWithChildren[];
  createdAt: string;
  updatedAt: string;
}
