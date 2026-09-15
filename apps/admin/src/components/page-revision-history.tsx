'use client';

import { useEffect, useState } from 'react';

import type { Page, PageRevisionDetail, PageRevisionSummary } from '@/lib/api';
import { formatDate } from '@/lib/format';

const STATUS_LABELS: Record<string, string> = { DRAFT: 'Taslak', PUBLISHED: 'Yayında' };

function authorName(author: PageRevisionSummary['createdBy']): string {
  if (!author) {
    return 'Bilinmiyor';
  }

  const name = [author.firstName, author.lastName].filter(Boolean).join(' ').trim();
  return name.length > 0 ? name : author.email;
}

export function PageRevisionHistory({ page }: { page: Page }) {
  const [revisions, setRevisions] = useState<PageRevisionSummary[] | null>(null);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PageRevisionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    void loadRevisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  async function loadRevisions() {
    setError('');

    try {
      const response = await fetch(`/api/pages/${page.id}/revisions`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Sürüm geçmişi yüklenemedi.');
      }

      setRevisions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sürüm geçmişi yüklenemedi.');
      setRevisions([]);
    }
  }

  async function toggleExpand(revisionId: string) {
    if (expandedId === revisionId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(revisionId);
    setDetail(null);
    setDetailLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/pages/${page.id}/revisions/${revisionId}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Sürüm detayı yüklenemedi.');
      }

      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sürüm detayı yüklenemedi.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleRestore(revisionId: string) {
    setRestoringId(revisionId);
    setError('');

    try {
      const response = await fetch(`/api/pages/${page.id}/revisions/${revisionId}/restore`, {
        method: 'POST',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? 'Sürüm geri yüklenemedi.');
      }

      // The page's own fields and its sections just changed underneath the
      // sibling form/builder components — reload so everything reflects it.
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sürüm geri yüklenemedi.');
      setRestoringId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-sm font-semibold text-white">Sürüm Geçmişi</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Sayfa her kaydedildiğinde bir önceki hali otomatik olarak burada saklanır.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-2">
        {revisions === null ? (
          <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-10 text-sm text-zinc-500">
            Yükleniyor...
          </div>
        ) : revisions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-8 text-center text-sm text-zinc-500">
            Henüz kayıtlı bir sürüm yok. Sayfayı kaydettiğinizde burada görünecek.
          </div>
        ) : (
          revisions.map((revision) => (
            <div key={revision.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(revision.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        revision.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {STATUS_LABELS[revision.status] ?? revision.status}
                    </span>
                    <p className="truncate text-sm font-medium text-white">{revision.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDate(revision.createdAt)} · {authorName(revision.createdBy)}
                  </p>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(revision.id)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                  >
                    {expandedId === revision.id ? 'Kapat' : 'Detay'}
                  </button>

                  {confirmId === revision.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Emin misiniz?</span>
                      <button
                        type="button"
                        onClick={() => handleRestore(revision.id)}
                        disabled={restoringId === revision.id}
                        className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {restoringId === revision.id ? 'Geri yükleniyor...' : 'Evet, Geri Yükle'}
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
                      onClick={() => setConfirmId(revision.id)}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-indigo-400 transition hover:border-indigo-900 hover:bg-indigo-950/50"
                    >
                      Bu Sürümü Geri Yükle
                    </button>
                  )}
                </div>
              </div>

              {expandedId === revision.id && (
                <div className="border-t border-zinc-800 px-4 py-3">
                  {detailLoading ? (
                    <p className="text-xs text-zinc-500">Yükleniyor...</p>
                  ) : detail ? (
                    <div className="space-y-2 text-xs text-zinc-400">
                      <p>
                        <span className="text-zinc-500">Slug:</span>{' '}
                        <span className="font-mono">{detail.slug}</span>
                      </p>
                      {detail.seoTitle && (
                        <p>
                          <span className="text-zinc-500">SEO Başlık:</span> {detail.seoTitle}
                        </p>
                      )}
                      <p>
                        <span className="text-zinc-500">Bölüm sayısı:</span> {detail.sections?.length ?? 0}
                      </p>
                      {detail.body && (
                        <p className="line-clamp-3 whitespace-pre-line text-zinc-300">{detail.body}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
