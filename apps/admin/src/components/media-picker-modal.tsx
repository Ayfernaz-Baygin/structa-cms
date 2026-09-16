'use client';

import { useEffect, useState } from 'react';

import type { Media, MediaPagination } from '@/lib/api';

import { MediaCard } from './media-card';

export type MediaPickerAccept = 'image' | 'document' | 'all';

interface MediaPickerModalProps {
  accept: MediaPickerAccept;
  onSelect: (media: Media) => void;
  onClose: () => void;
}

type FilterType = 'all' | 'image' | 'document';

const PAGE_LIMIT = 24;

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'image', label: 'Görseller' },
  { value: 'document', label: 'Belgeler' },
];

export function MediaPickerModal({ accept, onSelect, onClose }: MediaPickerModalProps) {
  const allowFilterChoice = accept === 'all';

  const [items, setItems] = useState<Media[] | null>(null);
  const [pagination, setPagination] = useState<MediaPagination | null>(null);
  const [filter, setFilter] = useState<FilterType>(allowFilterChoice ? 'all' : accept);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Media | null>(null);

  async function loadMedia() {
    setError('');

    const params = new URLSearchParams();
    if (filter !== 'all') {
      params.set('type', filter);
    }
    if (search) {
      params.set('search', search);
    }
    params.set('page', String(page));
    params.set('limit', String(PAGE_LIMIT));

    try {
      const response = await fetch(`/api/media?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Medya yüklenemedi.');
      }

      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Medya yüklenemedi.');
      setItems([]);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    queueMicrotask(() => void loadMedia());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search, page]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleConfirm() {
    if (selected) {
      onSelect(selected);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 id="media-picker-title" className="text-lg font-semibold text-white">
            Medya Seç
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
              <path d="M6 6l12 12M6 18 18 6" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-6 py-4">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Ara..."
            aria-label="Medya ara"
            className="w-full max-w-xs rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
          />

          {allowFilterChoice && (
            <div className="flex items-center gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setFilter(item.value);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === item.value
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {items === null ? (
            <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-16 text-sm text-zinc-500">
              Yükleniyor...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-16 text-center">
              <p className="text-sm font-medium text-white">Uygun medya bulunamadı.</p>
              <p className="mt-1 text-sm text-zinc-500">
                Yeni dosya yüklemek için Medya Kütüphanesi ekranını kullanın.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  selected={selected?.id === media.id}
                  onClick={() => setSelected(media)}
                />
              ))}
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-zinc-800 px-6 py-3">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Önceki
            </button>
            <span className="text-sm text-zinc-400">
              Sayfa {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sonraki
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Seç
          </button>
        </div>
      </div>
    </div>
  );
}
