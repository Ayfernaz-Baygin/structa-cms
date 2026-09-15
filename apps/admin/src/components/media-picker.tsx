'use client';

import { useId, useState } from 'react';

import { resolveFieldImageUrl, type Media } from '@/lib/api';

import { MediaPickerModal, type MediaPickerAccept } from './media-picker-modal';

interface MediaPickerProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  accept?: MediaPickerAccept;
  placeholder?: string;
}

export function MediaPicker({
  label,
  value,
  onChange,
  accept = 'image',
  placeholder = 'https://...',
}: MediaPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputId = useId();

  const previewUrl = accept !== 'document' ? resolveFieldImageUrl(value) : null;

  function handleSelect(media: Media) {
    onChange(media.url);
    setPickerOpen(false);
  }

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}

      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
      />

      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
        >
          Medyadan Seç
        </button>

        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:text-red-400"
          >
            Seçimi Temizle
          </button>
        )}
      </div>

      {previewUrl && (
        <div className="mt-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Önizleme" className="h-full w-full object-cover" />
        </div>
      )}

      {pickerOpen && (
        <MediaPickerModal
          accept={accept}
          onSelect={handleSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
