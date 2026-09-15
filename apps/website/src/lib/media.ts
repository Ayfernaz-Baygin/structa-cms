const PUBLIC_MEDIA_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Media URLs from the CMS can be absolute (external) or backend-relative
 * (e.g. "/uploads/images/x.jpg"); this is the single place that resolves both.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${PUBLIC_MEDIA_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
