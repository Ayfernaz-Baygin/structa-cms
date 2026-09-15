'use client';

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';

import type { Media, MediaPagination } from '@/lib/api';

import { MediaCard } from './media-card';
import { MediaDetailModal } from './media-detail-modal';

type FilterType = 'all' | 'image' | 'document';

const PAGE_LIMIT = 24;

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'image', label: 'Görseller' },
  { value: 'document', label: 'Belgeler' },
];

function uploadFile(file: File, onProgress: (percent: number) => void): Promise<Media> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/media');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: unknown = null;

      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // ignore parse errors, handled below
      }

      if (xhr.status >= 200 && xhr.status < 300 && data) {
        resolve(data as Media);
        return;
      }

      const message =
        data && typeof data === 'object' && 'message' in data
          ? Array.isArray((data as { message: unknown }).message)
            ? ((data as { message: string[] }).message.join(' '))
            : ((data as { message: string }).message)
          : undefined;

      reject(new Error(message ?? 'Dosya yüklenemedi.'));
    };

    xhr.onerror = () => reject(new Error('Sunucuya bağlanılamadı.'));

    xhr.send(formData);
  });
}

export function MediaLibrary() {
  const [items, setItems] = useState<Media[] | null>(null);
  const [pagination, setPagination] = useState<MediaPagination | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    void loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search, page]);

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

  async function handleUpload(file: File) {
    setUploadError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      await uploadFile(file, setUploadProgress);
      setPage(1);
      await loadMedia();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Dosya yüklenemedi.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleMediaUpdated(updated: Media) {
    setItems((prev) => prev?.map((item) => (item.id === updated.id ? updated : item)) ?? prev);
    setSelectedMedia(updated);
  }

  function handleMediaDeleted(id: string) {
    setItems((prev) => prev?.filter((item) => item.id !== id) ?? prev);
    setSelectedMedia(null);
    void loadMedia();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
          <h1 className="mt-2 text-3xl font-semibold">Medya Kütüphanesi</h1>
          <p className="mt-2 text-zinc-400">Web sitesinde kullanılacak görsel ve dosyaları yönetin.</p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? `Yükleniyor... %${uploadProgress}` : '+ Dosya Yükle'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {uploadError && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {uploadError}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
          dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-800'
        }`}
      >
        <p className="text-sm text-zinc-400">
          Dosyayı buraya sürükleyip bırakın veya{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            dosya seçin
          </button>
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          JPEG, PNG, WEBP, GIF, SVG veya PDF · maks. 10 MB
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
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

        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Ara..."
          className="w-full max-w-xs rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
        />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6">
        {items === null ? (
          <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-sm text-zinc-500">
            Yükleniyor...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-center">
            <p className="text-sm font-medium text-white">Henüz medya yüklenmedi.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Başlamak için &quot;+ Dosya Yükle&quot; butonunu kullanın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((media) => (
              <MediaCard key={media.id} media={media} onClick={() => setSelectedMedia(media)} />
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
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

      {selectedMedia && (
        <MediaDetailModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onUpdated={handleMediaUpdated}
          onDeleted={handleMediaDeleted}
        />
      )}
    </div>
  );
}
