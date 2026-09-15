import type { PostAuthor } from './api';

export function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatAuthorName(author: PostAuthor): string | null {
  const name = [author.firstName, author.lastName].filter(Boolean).join(' ').trim();
  return name.length > 0 ? name : null;
}
