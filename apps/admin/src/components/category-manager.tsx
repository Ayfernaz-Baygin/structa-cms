'use client';

import { FormEvent, useEffect, useState } from 'react';

import type { ProjectCategory } from '@/lib/api';
import { slugify } from '@/lib/slug';

export function CategoryManager() {
  const [categories, setCategories] = useState<ProjectCategory[] | null>(null);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void loadCategories();
  }, []);

  async function loadCategories() {
    setError('');

    try {
      const response = await fetch('/api/project-categories', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Kategoriler yüklenemedi.');
      }

      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategoriler yüklenemedi.');
      setCategories([]);
    }
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/project-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Bu slug zaten kullanılıyor.');
        }
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message ?? 'Kategori kaydedilemedi.');
      }

      setName('');
      setSlug('');
      setSlugTouched(false);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori kaydedilemedi.');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(category: ProjectCategory) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
  }

  async function handleUpdate(id: string) {
    setSavingEdit(true);
    setError('');

    try {
      const response = await fetch(`/api/project-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, slug: editSlug }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Bu slug zaten kullanılıyor.');
        }
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message ?? 'Kategori güncellenemedi.');
      }

      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori güncellenemedi.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError('');

    try {
      const response = await fetch(`/api/project-categories/${id}`, { method: 'DELETE' });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Kategori silinemedi.');
      }

      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori silinemedi.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-sm font-semibold text-white">Kategoriler</h2>
      <p className="mt-1 text-xs text-zinc-500">Proje kategorilerini yönetin.</p>

      {error && (
        <div className="mt-3 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[140px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Ad</label>
          <input
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Slug</label>
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? 'Kaydediliyor...' : '+ Ekle'}
        </button>
      </form>

      <div className="mt-5 divide-y divide-zinc-800/60">
        {categories === null ? (
          <p className="py-4 text-sm text-zinc-500">Yükleniyor...</p>
        ) : categories.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">Henüz kategori oluşturulmadı.</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              {editingId === category.id ? (
                <>
                  <div className="flex min-w-[220px] flex-1 flex-wrap gap-2">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="min-w-[120px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
                    />
                    <input
                      value={editSlug}
                      onChange={(event) => setEditSlug(event.target.value)}
                      className="min-w-[120px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 font-mono text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(category.id)}
                      disabled={savingEdit}
                      className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
                    >
                      Vazgeç
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-white">{category.name}</p>
                    <p className="font-mono text-xs text-zinc-500">{category.slug}</p>
                  </div>

                  {confirmId === category.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Emin misiniz?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingId === category.id}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === category.id ? 'Siliniyor...' : 'Evet, Sil'}
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(category.id)}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-900 hover:bg-red-950/50"
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
