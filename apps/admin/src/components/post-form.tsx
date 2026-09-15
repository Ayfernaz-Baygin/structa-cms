'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import type { Post, PostCategory, PostStatus } from '@/lib/api';
import { slugify } from '@/lib/slug';

interface PostFormProps {
  initialPost?: Post;
}

export function PostForm({ initialPost }: PostFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialPost);

  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? '');
  const [content, setContent] = useState(initialPost?.content ?? '');
  const [categoryId, setCategoryId] = useState(initialPost?.categoryId ?? '');
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage ?? '');
  const [status, setStatus] = useState<PostStatus>(initialPost?.status ?? 'DRAFT');
  const [seoTitle, setSeoTitle] = useState(initialPost?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialPost?.seoDescription ?? '');

  const [categories, setCategories] = useState<PostCategory[] | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch('/api/post-categories', { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled && response.ok) {
          setCategories(data);
        } else if (!cancelled) {
          setCategories([]);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  function regenerateSlug() {
    setSlug(slugify(title));
    setSlugTouched(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title,
      slug,
      excerpt: excerpt.trim().length > 0 ? excerpt : undefined,
      content: content.trim().length > 0 ? content : undefined,
      categoryId: categoryId.length > 0 ? categoryId : null,
      coverImage: coverImage.trim().length > 0 ? coverImage : undefined,
      status,
      seoTitle: seoTitle.trim().length > 0 ? seoTitle : undefined,
      seoDescription: seoDescription.trim().length > 0 ? seoDescription : undefined,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/posts/${initialPost!.id}` : '/api/posts',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          setError('Bu slug zaten kullanılıyor. Lütfen farklı bir slug girin.');
        } else if (response.status === 400 && data) {
          const message = Array.isArray(data.message)
            ? data.message.join(' ')
            : data.message;
          setError(message ?? 'Girdiğiniz bilgiler geçersiz.');
        } else {
          setError(data?.message ?? 'Yazı kaydedilemedi.');
        }
        return;
      }

      router.push('/blog');
      router.refresh();
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-300">
                Başlık
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => handleTitleChange(event.target.value)}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="slug" className="block text-sm font-medium text-zinc-300">
                  Slug
                </label>
                <button
                  type="button"
                  onClick={regenerateSlug}
                  className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
                >
                  Başlıktan oluştur
                </button>
              </div>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Yalnızca küçük harf, rakam ve tire (-) kullanın."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="mt-5">
              <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-zinc-300">
                Özet
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={2}
                className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="mt-5">
              <label htmlFor="content" className="mb-2 block text-sm font-medium text-zinc-300">
                İçerik
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={14}
                className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-white">SEO</h2>

            <div className="mt-4">
              <label htmlFor="seoTitle" className="mb-2 block text-sm font-medium text-zinc-300">
                SEO Başlığı
              </label>
              <input
                id="seoTitle"
                type="text"
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="seoDescription"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                SEO Açıklaması
              </label>
              <textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                rows={3}
                className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <label htmlFor="status" className="mb-2 block text-sm font-medium text-zinc-300">
              Durum
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as PostStatus)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            >
              <option value="DRAFT">Taslak</option>
              <option value="PUBLISHED">Yayında</option>
            </select>

            <div className="mt-5">
              <label htmlFor="categoryId" className="mb-2 block text-sm font-medium text-zinc-300">
                Kategori
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              >
                <option value="">Kategori Yok</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories !== null && categories.length === 0 && (
                <p className="mt-2 text-xs text-zinc-500">
                  Henüz kategori yok. Kategoriler panelinden ekleyebilirsiniz.
                </p>
              )}
            </div>
          </div>

          {isEdit && initialPost && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm font-medium text-zinc-300">Yazar</p>
              <p className="mt-2 text-sm text-white">
                {[initialPost.author.firstName, initialPost.author.lastName]
                  .filter(Boolean)
                  .join(' ') || initialPost.author.email}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{initialPost.author.email}</p>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <label htmlFor="coverImage" className="mb-2 block text-sm font-medium text-zinc-300">
              Kapak Görseli URL
            </label>
            <input
              id="coverImage"
              type="text"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Kaydediliyor...' : isEdit ? 'Değişiklikleri Kaydet' : 'Yazıyı Oluştur'}
        </button>

        <Link
          href="/blog"
          className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
