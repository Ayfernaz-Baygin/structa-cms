'use client';

import { useState } from 'react';

import { getMediaUrl, type Media } from '@/lib/api';
import { formatDate, formatFileSize } from '@/lib/format';

interface MediaDetailModalProps {
  media: Media;
  onClose: () => void;
  onUpdated: (media: Media) => void;
  onDeleted: (id: string) => void;
}

function uploaderName(media: Media): string {
  const fullName = [media.uploadedBy.firstName, media.uploadedBy.lastName]
    .filter(Boolean)
    .join(' ');
  return fullName.length > 0 ? fullName : media.uploadedBy.email;
}

export function MediaDetailModal({ media, onClose, onUpdated, onDeleted }: MediaDetailModalProps) {
  const [title, setTitle] = useState(media.title ?? '');
  const [altText, setAltText] = useState(media.altText ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isImage = media.mimeType.startsWith('image/');
  const fullUrl = getMediaUrl(media);

  async function handleSave() {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim().length > 0 ? title : undefined,
          altText: altText.trim().length > 0 ? altText : undefined,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message ?? 'Medya güncellenemedi.');
      }

      onUpdated(data as Media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Medya güncellenemedi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('URL kopyalanamadı.');
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/media/${media.id}`, { method: 'DELETE' });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? 'Medya silinemedi.');
      }

      onDeleted(media.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Medya silinemedi.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Medya Detayı</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Kapat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
              <path d="M6 6l12 12M6 18 18 6" />
            </svg>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fullUrl}
                alt={media.altText ?? media.originalName}
                className="max-h-64 w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-zinc-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-16 w-16">
                  <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
                  <path d="M14 3v5h5" />
                </svg>
                <span className="text-xs font-medium uppercase">{media.extension}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <DetailRow label="Dosya Adı" value={media.originalName} />
            <DetailRow label="MIME Türü" value={media.mimeType} />
            <DetailRow label="Boyut" value={formatFileSize(media.size)} />
            {media.width && media.height && (
              <DetailRow label="Boyutlar" value={`${media.width} × ${media.height}`} />
            )}
            <DetailRow label="Yüklenme Tarihi" value={formatDate(media.createdAt)} />
            <DetailRow label="Yükleyen" value={uploaderName(media)} />

            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-500">URL</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={fullUrl}
                  className="w-full truncate rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="shrink-0 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                >
                  {copied ? 'Kopyalandı!' : "URL'yi Kopyala"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="media-title" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Title
            </label>
            <input
              id="media-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="media-alt" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Alt Text
            </label>
            <input
              id="media-alt"
              type="text"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Emin misiniz?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
              >
                Vazgeç
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:border-red-900 hover:bg-red-950/50"
            >
              Sil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-0.5 break-words text-white">{value}</p>
    </div>
  );
}
