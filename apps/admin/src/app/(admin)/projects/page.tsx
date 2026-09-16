'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CategoryManager } from '@/components/category-manager';
import type { Project } from '@/lib/api';

const STATUS_LABELS: Record<Project['status'], string> = {
  DRAFT: 'Taslak',
  PUBLISHED: 'Yayında',
};

const STATUS_BADGE_CLASSES: Record<Project['status'], string> = {
  DRAFT: 'bg-zinc-800 text-zinc-300',
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  async function loadProjects() {
    setError('');

    try {
      const response = await fetch('/api/projects', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Projeler yüklenemedi.');
      }

      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Projeler yüklenemedi.');
      setProjects([]);
    }
  }

  useEffect(() => {
    queueMicrotask(() => void loadProjects());
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError('');

    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Proje silinemedi.');
      }

      setProjects((prev) => prev?.filter((project) => project.id !== id) ?? prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Proje silinemedi.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
          <h1 className="mt-2 text-3xl font-semibold">Projeler</h1>
          <p className="mt-2 text-zinc-400">Web sitesinde gösterilecek projeleri yönetin.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCategories((prev) => !prev)}
            className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
          >
            {showCategories ? 'Kategorileri Gizle' : 'Kategorileri Yönet'}
          </button>

          <Link
            href="/projects/new"
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            + Yeni Proje
          </Link>
        </div>
      </div>

      {showCategories && (
        <div className="mt-6">
          <CategoryManager />
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        {projects === null ? (
          <div className="flex items-center justify-center px-6 py-16 text-sm text-zinc-500">
            Yükleniyor...
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm font-medium text-white">Henüz proje oluşturulmadı.</p>
            <p className="mt-1 text-sm text-zinc-500">
              İlk projenizi oluşturmak için &quot;Yeni Proje&quot; butonunu kullanın.
            </p>
            <Link
              href="/projects/new"
              className="mt-5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
            >
              + Yeni Proje
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-6 py-4 font-medium">Başlık</th>
                  <th className="px-6 py-4 font-medium">Kategori</th>
                  <th className="px-6 py-4 font-medium">Müşteri</th>
                  <th className="px-6 py-4 font-medium">Konum</th>
                  <th className="px-6 py-4 font-medium">Durum</th>
                  <th className="px-6 py-4 font-medium">Sıra</th>
                  <th className="px-6 py-4 font-medium">Son Güncelleme</th>
                  <th className="px-6 py-4 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-zinc-800/60 last:border-0">
                    <td className="px-6 py-4 font-medium text-white">{project.title}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {project.category ? project.category.name : '—'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{project.clientName ?? '—'}</td>
                    <td className="px-6 py-4 text-zinc-400">{project.location ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[project.status]}`}
                      >
                        {STATUS_LABELS[project.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{project.sortOrder}</td>
                    <td className="px-6 py-4 text-zinc-400">{formatDate(project.updatedAt)}</td>
                    <td className="px-6 py-4">
                      {confirmId === project.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-zinc-400">Emin misiniz?</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(project.id)}
                            disabled={deletingId === project.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === project.id ? 'Siliniyor...' : 'Evet, Sil'}
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
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/projects/${project.id}/edit`}
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                          >
                            Düzenle
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmId(project.id)}
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-900 hover:bg-red-950/50"
                          >
                            Sil
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
