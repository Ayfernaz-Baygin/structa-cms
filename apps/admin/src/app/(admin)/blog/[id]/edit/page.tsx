'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';

import { PostForm } from '@/components/post-form';
import type { Post } from '@/lib/api';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      setError('');
      setNotFound(false);

      try {
        const response = await fetch(`/api/posts/${id}`, { cache: 'no-store' });
        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message ?? 'Yazı yüklenemedi.');
        }

        setPost(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Yazı yüklenemedi.');
        }
      }
    }

    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
      <h1 className="mt-2 text-3xl font-semibold">Yazıyı Düzenle</h1>
      <p className="mt-2 text-zinc-400">Yazı içeriğini ve yayın durumunu güncelleyin.</p>

      <div className="mt-8">
        {notFound ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-center">
            <p className="text-sm font-medium text-white">Yazı bulunamadı.</p>
            <Link
              href="/blog"
              className="mt-4 inline-block rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              Bloga Dön
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : post === null ? (
          <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-sm text-zinc-500">
            Yükleniyor...
          </div>
        ) : (
          <PostForm initialPost={post} />
        )}
      </div>
    </div>
  );
}
