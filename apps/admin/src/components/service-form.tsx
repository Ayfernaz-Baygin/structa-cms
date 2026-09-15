'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import type { Service, ServiceStatus } from '@/lib/api';
import { slugify } from '@/lib/slug';

interface ServiceFormProps {
  initialService?: Service;
}

export function ServiceForm({ initialService }: ServiceFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialService);

  const [title, setTitle] = useState(initialService?.title ?? '');
  const [slug, setSlug] = useState(initialService?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [shortDescription, setShortDescription] = useState(
    initialService?.shortDescription ?? '',
  );
  const [description, setDescription] = useState(initialService?.description ?? '');
  const [icon, setIcon] = useState(initialService?.icon ?? '');
  const [coverImage, setCoverImage] = useState(initialService?.coverImage ?? '');
  const [sortOrder, setSortOrder] = useState(String(initialService?.sortOrder ?? 0));
  const [status, setStatus] = useState<ServiceStatus>(initialService?.status ?? 'DRAFT');
  const [seoTitle, setSeoTitle] = useState(initialService?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialService?.seoDescription ?? '');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

    const parsedSortOrder = Number.parseInt(sortOrder, 10);

    const payload = {
      title,
      slug,
      shortDescription: shortDescription.trim().length > 0 ? shortDescription : undefined,
      description: description.trim().length > 0 ? description : undefined,
      icon: icon.trim().length > 0 ? icon : undefined,
      coverImage: coverImage.trim().length > 0 ? coverImage : undefined,
      status,
      sortOrder: Number.isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
      seoTitle: seoTitle.trim().length > 0 ? seoTitle : undefined,
      seoDescription: seoDescription.trim().length > 0 ? seoDescription : undefined,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/services/${initialService!.id}` : '/api/services',
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
          setError(data?.message ?? 'Hizmet kaydedilemedi.');
        }
        return;
      }

      router.push('/services');
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
              <label
                htmlFor="shortDescription"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Kısa Açıklama
              </label>
              <textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)}
                rows={2}
                className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </div>

            <div className="mt-5">
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-300">
                Açıklama
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={10}
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
              onChange={(event) => setStatus(event.target.value as ServiceStatus)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            >
              <option value="DRAFT">Taslak</option>
              <option value="PUBLISHED">Yayında</option>
            </select>

            <div className="mt-5">
              <label htmlFor="sortOrder" className="mb-2 block text-sm font-medium text-zinc-300">
                Sıralama
              </label>
              <input
                id="sortOrder"
                type="number"
                step={1}
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <label htmlFor="icon" className="mb-2 block text-sm font-medium text-zinc-300">
              İkon
            </label>
            <input
              id="icon"
              type="text"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              placeholder="ör. briefcase"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />

            <div className="mt-5">
              <label
                htmlFor="coverImage"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
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
          {saving ? 'Kaydediliyor...' : isEdit ? 'Değişiklikleri Kaydet' : 'Hizmeti Oluştur'}
        </button>

        <Link
          href="/services"
          className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
