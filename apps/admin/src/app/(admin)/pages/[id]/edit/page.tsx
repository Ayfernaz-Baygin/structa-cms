'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';

import { PageForm } from '@/components/page-form';
import type { Page } from '@/lib/api';

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setError('');
      setNotFound(false);

      try {
        const response = await fetch(`/api/pages/${id}`, { cache: 'no-store' });
        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message ?? 'Sayfa yüklenemedi.');
        }

        setPage(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Sayfa yüklenemedi.');
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
      <h1 className="mt-2 text-3xl font-semibold">Sayfayı Düzenle</h1>
      <p className="mt-2 text-zinc-400">Sayfa içeriğini ve yayın durumunu güncelleyin.</p>

      <div className="mt-8">
        {notFound ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-center">
            <p className="text-sm font-medium text-white">Sayfa bulunamadı.</p>
            <Link
              href="/pages"
              className="mt-4 inline-block rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              Sayfalara Dön
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : page === null ? (
          <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-sm text-zinc-500">
            Yükleniyor...
          </div>
        ) : (
          <PageForm initialPage={page} />
        )}
      </div>
    </div>
  );
}
