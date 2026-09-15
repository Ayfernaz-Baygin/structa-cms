'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CategoryManager } from '@/components/category-manager';
import type { Post } from '@/lib/api';

const STATUS_LABELS: Record<Post['status'], string> = {
  DRAFT: 'Taslak',
  PUBLISHED: 'Yayında',
};

const STATUS_BADGE_CLASSES: Record<Post['status'], string> = {
  DRAFT: 'bg-zinc-800 text-zinc-300',
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400',
};

function formatDate(value: string | null) {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function authorName(post: Post) {
  const fullName = [post.author.firstName, post.author.lastName].filter(Boolean).join(' ');
  return fullName.length > 0 ? fullName : post.author.email;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    void loadPosts();
  }, []);

  async function loadPosts() {
    setError('');

    try {
      const response = await fetch('/api/posts', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Yazılar yüklenemedi.');
      }

      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yazılar yüklenemedi.');
      setPosts([]);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError('');

    try {
      const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Yazı silinemedi.');
      }

      setPosts((prev) => prev?.filter((post) => post.id !== id) ?? prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yazı silinemedi.');
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
          <h1 className="mt-2 text-3xl font-semibold">Blog</h1>
          <p className="mt-2 text-zinc-400">Web sitesindeki blog yazılarını yönetin.</p>
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
            href="/blog/new"
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            + Yeni Yazı
          </Link>
        </div>
      </div>

      {showCategories && (
        <div className="mt-6">
          <CategoryManager
            endpoint="/api/post-categories"
            description="Blog kategorilerini yönetin."
          />
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        {posts === null ? (
          <div className="flex items-center justify-center px-6 py-16 text-sm text-zinc-500">
            Yükleniyor...
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="text-sm font-medium text-white">Henüz yazı oluşturulmadı.</p>
            <p className="mt-1 text-sm text-zinc-500">
              İlk yazınızı oluşturmak için &quot;Yeni Yazı&quot; butonunu kullanın.
            </p>
            <Link
              href="/blog/new"
              className="mt-5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
            >
              + Yeni Yazı
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-6 py-4 font-medium">Başlık</th>
                  <th className="px-6 py-4 font-medium">Kategori</th>
                  <th className="px-6 py-4 font-medium">Yazar</th>
                  <th className="px-6 py-4 font-medium">Durum</th>
                  <th className="px-6 py-4 font-medium">Yayın Tarihi</th>
                  <th className="px-6 py-4 font-medium">Son Güncelleme</th>
                  <th className="px-6 py-4 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-zinc-800/60 last:border-0">
                    <td className="px-6 py-4 font-medium text-white">{post.title}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {post.category ? post.category.name : '—'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{authorName(post)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[post.status]}`}
                      >
                        {STATUS_LABELS[post.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{formatDate(post.publishedAt)}</td>
                    <td className="px-6 py-4 text-zinc-400">{formatDate(post.updatedAt)}</td>
                    <td className="px-6 py-4">
                      {confirmId === post.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-zinc-400">Emin misiniz?</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingId === post.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === post.id ? 'Siliniyor...' : 'Evet, Sil'}
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
                            href={`/blog/${post.id}/edit`}
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                          >
                            Düzenle
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmId(post.id)}
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
