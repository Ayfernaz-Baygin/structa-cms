import { getLocale } from "./locale";
const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export type MenuLocation = "HEADER" | "FOOTER";
export type MenuItemTarget = "SELF" | "BLANK";

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
  homePage: { slug: string } | null;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  target: MenuItemTarget;
  sortOrder: number;
  children: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  location: MenuLocation;
  items: MenuItem[];
}

export type SectionType =
  "HERO" | "TEXT" | "IMAGE_TEXT" | "SERVICES" | "PROJECTS" | "POSTS" | "CTA";

export interface HeroSectionData {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface TextSectionData {
  title?: string;
  body: string;
}

export interface ImageTextSectionData {
  title?: string;
  body: string;
  imageUrl: string;
  imagePosition?: "left" | "right";
}

export interface ListSectionData {
  title?: string;
  limit?: number;
}

export interface CtaSectionData {
  title: string;
  description?: string;
  buttonLabel: string;
  buttonUrl: string;
  imageUrl?: string;
}

export interface PageSection {
  id: string;
  type: SectionType;
  sortOrder: number;
  data: Record<string, unknown>;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  sections: PageSection[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  icon: string | null;
  coverImage: string | null;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
}

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
}

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
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  category: ProjectCategory | null;
  images: ProjectImage[];
  publishedAt: string | null;
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PostAuthor {
  firstName: string | null;
  lastName: string | null;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  category: PostCategory | null;
  author: PostAuthor;
  publishedAt: string | null;
}

class PublicApiError extends Error {}

async function publicFetch<T>(path: string): Promise<T> {
  const locale = await getLocale();
  const localizedPath = `${path}${path.includes("?") ? "&" : "?"}locale=${locale}`;
  let response: Response;

  try {
    response = await fetch(`${API_URL}/public${localizedPath}`, {
      cache: "no-store",
    });
  } catch {
    throw new PublicApiError("İçerik sunucusuna şu anda ulaşılamıyor.");
  }

  if (response.status === 404) {
    throw new PublicApiError("NOT_FOUND");
  }

  if (!response.ok) {
    throw new PublicApiError("İçerik yüklenirken bir sorun oluştu.");
  }

  return response.json() as Promise<T>;
}

async function publicFetchOrNull<T>(path: string): Promise<T | null> {
  try {
    return await publicFetch<T>(path);
  } catch (error) {
    if (error instanceof PublicApiError && error.message === "NOT_FOUND") {
      return null;
    }

    throw error;
  }
}

export function getSettings(): Promise<SiteSettings> {
  return publicFetch<SiteSettings>("/settings");
}

export function getMenu(location: MenuLocation): Promise<Menu | null> {
  return publicFetchOrNull<Menu>(`/menus/${location}`);
}

export function getPageBySlug(slug: string): Promise<Page | null> {
  return publicFetchOrNull<Page>(`/pages/${encodeURIComponent(slug)}`);
}

export function getServices(limit?: number): Promise<Service[]> {
  const query = limit ? `?limit=${limit}` : "";
  return publicFetch<Service[]>(`/services${query}`);
}

export function getServiceBySlug(slug: string): Promise<Service | null> {
  return publicFetchOrNull<Service>(`/services/${encodeURIComponent(slug)}`);
}

export function getProjects(limit?: number): Promise<Project[]> {
  const query = limit ? `?limit=${limit}` : "";
  return publicFetch<Project[]>(`/projects${query}`);
}

export function getProjectBySlug(slug: string): Promise<Project | null> {
  return publicFetchOrNull<Project>(`/projects/${encodeURIComponent(slug)}`);
}

export function getPosts(limit?: number): Promise<Post[]> {
  const query = limit ? `?limit=${limit}` : "";
  return publicFetch<Post[]>(`/posts${query}`);
}

export function getPostBySlug(slug: string): Promise<Post | null> {
  return publicFetchOrNull<Post>(`/posts/${encodeURIComponent(slug)}`);
}
