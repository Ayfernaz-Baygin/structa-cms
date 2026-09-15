'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import type { Project, ProjectCategory, ProjectImage, ProjectStatus } from '@/lib/api';
import { slugify } from '@/lib/slug';

function toDateInputValue(value: string | null): string {
  if (!value) {
    return '';
  }
  return value.slice(0, 10);
}

interface ProjectFormProps {
  initialProject?: Project;
}

export function ProjectForm({ initialProject }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialProject);

  const [title, setTitle] = useState(initialProject?.title ?? '');
  const [slug, setSlug] = useState(initialProject?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [shortDescription, setShortDescription] = useState(
    initialProject?.shortDescription ?? '',
  );
  const [description, setDescription] = useState(initialProject?.description ?? '');
  const [clientName, setClientName] = useState(initialProject?.clientName ?? '');
  const [location, setLocation] = useState(initialProject?.location ?? '');
  const [projectDate, setProjectDate] = useState(toDateInputValue(initialProject?.projectDate ?? null));
  const [categoryId, setCategoryId] = useState(initialProject?.categoryId ?? '');
  const [coverImage, setCoverImage] = useState(initialProject?.coverImage ?? '');
  const [sortOrder, setSortOrder] = useState(String(initialProject?.sortOrder ?? 0));
  const [status, setStatus] = useState<ProjectStatus>(initialProject?.status ?? 'DRAFT');
  const [seoTitle, setSeoTitle] = useState(initialProject?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialProject?.seoDescription ?? '');

  const [categories, setCategories] = useState<ProjectCategory[] | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch('/api/project-categories', { cache: 'no-store' });
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

    const parsedSortOrder = Number.parseInt(sortOrder, 10);

    const payload = {
      title,
      slug,
      shortDescription: shortDescription.trim().length > 0 ? shortDescription : undefined,
      description: description.trim().length > 0 ? description : undefined,
      clientName: clientName.trim().length > 0 ? clientName : undefined,
      location: location.trim().length > 0 ? location : undefined,
      projectDate: projectDate.length > 0 ? projectDate : undefined,
      categoryId: categoryId.length > 0 ? categoryId : null,
      coverImage: coverImage.trim().length > 0 ? coverImage : undefined,
      status,
      sortOrder: Number.isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
      seoTitle: seoTitle.trim().length > 0 ? seoTitle : undefined,
      seoDescription: seoDescription.trim().length > 0 ? seoDescription : undefined,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/projects/${initialProject!.id}` : '/api/projects',
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
          setError(data?.message ?? 'Proje kaydedilemedi.');
        }
        return;
      }

      router.push('/projects');
      router.refresh();
    } catch {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
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
                onChange={(event) => setStatus(event.target.value as ProjectStatus)}
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
                    Henüz kategori yok. Kategoriler listesinden ekleyebilirsiniz.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <label htmlFor="clientName" className="mb-2 block text-sm font-medium text-zinc-300">
                Müşteri
              </label>
              <input
                id="clientName"
                type="text"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />

              <div className="mt-5">
                <label htmlFor="location" className="mb-2 block text-sm font-medium text-zinc-300">
                  Konum
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="projectDate" className="mb-2 block text-sm font-medium text-zinc-300">
                  Proje Tarihi
                </label>
                <input
                  id="projectDate"
                  type="date"
                  value={projectDate}
                  onChange={(event) => setProjectDate(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <label htmlFor="coverImage" className="mb-2 block text-sm font-medium text-zinc-300">
                Cover Image URL
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
            {saving ? 'Kaydediliyor...' : isEdit ? 'Değişiklikleri Kaydet' : 'Projeyi Oluştur'}
          </button>

          <Link
            href="/projects"
            className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
          >
            İptal
          </Link>
        </div>
      </form>

      {isEdit && initialProject && <ProjectGallery project={initialProject} />}
    </div>
  );
}

function ProjectGallery({ project }: { project: Project }) {
  const [images, setImages] = useState<ProjectImage[]>(project.images);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [imageSortOrder, setImageSortOrder] = useState('0');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleAddImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdding(true);
    setError('');

    const parsedSortOrder = Number.parseInt(imageSortOrder, 10);

    try {
      const response = await fetch(`/api/projects/${project.id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          altText: altText.trim().length > 0 ? altText : undefined,
          sortOrder: Number.isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message ?? 'Görsel eklenemedi.');
      }

      setImages((data as Project).images);
      setImageUrl('');
      setAltText('');
      setImageSortOrder('0');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel eklenemedi.');
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    setDeletingId(imageId);
    setError('');

    try {
      const response = await fetch(`/api/projects/${project.id}/images/${imageId}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? 'Görsel silinemedi.');
      }

      setImages((data as Project).images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel silinemedi.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-sm font-semibold text-white">Galeri Görselleri</h2>

      {error && (
        <div className="mt-3 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleAddImage} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1.5fr_0.7fr_auto]">
        <input
          type="text"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="Görsel URL"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        />
        <input
          type="text"
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          placeholder="Alt metin"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        />
        <input
          type="number"
          step={1}
          value={imageSortOrder}
          onChange={(event) => setImageSortOrder(event.target.value)}
          placeholder="Sıra"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adding ? 'Ekleniyor...' : '+ Ekle'}
        </button>
      </form>

      <div className="mt-5 divide-y divide-zinc-800/60">
        {images.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">Henüz galeri görseli eklenmedi.</p>
        ) : (
          images.map((image) => (
            <div key={image.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{image.imageUrl}</p>
                <p className="text-xs text-zinc-500">
                  {image.altText ? image.altText : 'Alt metin yok'} · Sıra: {image.sortOrder}
                </p>
              </div>

              {confirmId === image.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Emin misiniz?</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={deletingId === image.id}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === image.id ? 'Siliniyor...' : 'Evet, Sil'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
                  >
                    Vazgeç
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(image.id)}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-900 hover:bg-red-950/50"
                >
                  Sil
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
