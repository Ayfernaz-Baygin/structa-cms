'use client';

import { useEffect, useState } from 'react';

import type { Page, PageSection, SectionType } from '@/lib/api';

import { MediaPicker } from './media-picker';

const SECTION_TYPES: SectionType[] = [
  'HERO',
  'TEXT',
  'IMAGE_TEXT',
  'SERVICES',
  'PROJECTS',
  'POSTS',
  'CTA',
];

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  HERO: 'Hero',
  TEXT: 'Metin',
  IMAGE_TEXT: 'Görsel + Metin',
  SERVICES: 'Hizmetler',
  PROJECTS: 'Projeler',
  POSTS: 'Blog Yazıları',
  CTA: 'Çağrı (CTA)',
};

type FormData = Record<string, unknown>;

function toFormValue(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function getSectionLabel(section: PageSection): string {
  const title = section.data.title;
  if (typeof title === 'string' && title.trim().length > 0) {
    return title;
  }
  return SECTION_TYPE_LABELS[section.type];
}

/** Local form state is string-friendly; this converts it back to the shape the API expects. */
function prepareDataForSubmit(raw: FormData): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'string') {
      if (value.trim().length === 0) {
        continue;
      }

      if (key === 'limit') {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isNaN(parsed)) {
          cleaned[key] = parsed;
        }
        continue;
      }

      cleaned[key] = value;
      continue;
    }

    cleaned[key] = value;
  }

  return cleaned;
}

function TextField({
  label,
  value,
  onChange,
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  required = false,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</label>
      <input
        type="number"
        min={1}
        step={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionDataFields({
  type,
  data,
  onChange,
}: {
  type: SectionType;
  data: FormData;
  onChange: (data: FormData) => void;
}) {
  function set(key: string, value: unknown) {
    onChange({ ...data, [key]: value });
  }

  switch (type) {
    case 'HERO':
      return (
        <div className="space-y-4">
          <TextField label="Başlık" value={toFormValue(data.title)} onChange={(v) => set('title', v)} required />
          <TextField label="Alt Başlık" value={toFormValue(data.subtitle)} onChange={(v) => set('subtitle', v)} />
          <MediaPicker
            label="Görsel"
            value={toFormValue(data.imageUrl)}
            onChange={(v) => set('imageUrl', v)}
            accept="image"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Buton Metni" value={toFormValue(data.ctaLabel)} onChange={(v) => set('ctaLabel', v)} />
            <TextField label="Buton URL" value={toFormValue(data.ctaUrl)} onChange={(v) => set('ctaUrl', v)} placeholder="/iletisim" />
          </div>
        </div>
      );

    case 'TEXT':
      return (
        <div className="space-y-4">
          <TextField label="Başlık" value={toFormValue(data.title)} onChange={(v) => set('title', v)} />
          <TextAreaField label="Metin" value={toFormValue(data.body)} onChange={(v) => set('body', v)} required rows={6} />
        </div>
      );

    case 'IMAGE_TEXT':
      return (
        <div className="space-y-4">
          <TextField label="Başlık" value={toFormValue(data.title)} onChange={(v) => set('title', v)} />
          <TextAreaField label="Metin" value={toFormValue(data.body)} onChange={(v) => set('body', v)} required rows={6} />
          <MediaPicker
            label="Görsel"
            value={toFormValue(data.imageUrl)}
            onChange={(v) => set('imageUrl', v)}
            accept="image"
          />
          <SelectField
            label="Görsel Konumu"
            value={toFormValue(data.imagePosition) || 'left'}
            onChange={(v) => set('imagePosition', v)}
            options={[
              { value: 'left', label: 'Sol' },
              { value: 'right', label: 'Sağ' },
            ]}
          />
        </div>
      );

    case 'SERVICES':
    case 'PROJECTS':
    case 'POSTS':
      return (
        <div className="space-y-4">
          <TextField label="Başlık" value={toFormValue(data.title)} onChange={(v) => set('title', v)} />
          <NumberField label="Gösterilecek Adet" value={toFormValue(data.limit)} onChange={(v) => set('limit', v)} />
        </div>
      );

    case 'CTA':
      return (
        <div className="space-y-4">
          <TextField label="Başlık" value={toFormValue(data.title)} onChange={(v) => set('title', v)} required />
          <TextAreaField label="Açıklama" value={toFormValue(data.description)} onChange={(v) => set('description', v)} rows={3} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Buton Metni" value={toFormValue(data.buttonLabel)} onChange={(v) => set('buttonLabel', v)} required />
            <TextField label="Buton URL" value={toFormValue(data.buttonUrl)} onChange={(v) => set('buttonUrl', v)} required placeholder="/iletisim" />
          </div>
          <MediaPicker
            label="Görsel (opsiyonel)"
            value={toFormValue(data.imageUrl)}
            onChange={(v) => set('imageUrl', v)}
            accept="image"
          />
        </div>
      );

    default:
      return null;
  }
}

function SectionEditor({
  type,
  initialData,
  onCancel,
  onSave,
}: {
  type: SectionType;
  initialData: FormData;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [data, setData] = useState<FormData>(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');

    try {
      await onSave(prepareDataForSubmit(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bölüm kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionDataFields type={type} data={data} onChange={setData} />

      {error && (
        <div className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}

function SectionRow({
  section,
  isFirst,
  isLast,
  isEditing,
  onMove,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: {
  section: PageSection;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  onMove: (direction: 'up' | 'down') => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isEditing) {
    return (
      <div className="rounded-xl border border-indigo-900/50 bg-zinc-950 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-400">
          {SECTION_TYPE_LABELS[section.type]} Bölümünü Düzenle
        </p>
        <SectionEditor
          type={section.type}
          initialData={section.data}
          onCancel={onCancelEdit}
          onSave={onSave}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="min-w-0">
        <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-400">
          {SECTION_TYPE_LABELS[section.type]}
        </span>
        <p className="mt-1.5 truncate text-sm text-white">{getSectionLabel(section)}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onMove('up')}
          disabled={isFirst}
          aria-label="Yukarı taşı"
          className="rounded-lg border border-zinc-700 p-1.5 text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onMove('down')}
          disabled={isLast}
          aria-label="Aşağı taşı"
          className="rounded-lg border border-zinc-700 p-1.5 text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          Düzenle
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
            >
              Evet, Sil
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              Vazgeç
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-900 hover:bg-red-950/50"
          >
            Sil
          </button>
        )}
      </div>
    </div>
  );
}

export function PageSectionBuilder({ page }: { page: Page }) {
  const [sections, setSections] = useState<PageSection[] | null>(null);
  const [error, setError] = useState('');
  const [creatingType, setCreatingType] = useState<SectionType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  async function loadSections() {
    setError('');

    try {
      const response = await fetch(`/api/pages/${page.id}/sections`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Bölümler yüklenemedi.');
      }

      setSections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bölümler yüklenemedi.');
      setSections([]);
    }
  }

  async function handleCreate(type: SectionType, data: Record<string, unknown>) {
    const response = await fetch(`/api/pages/${page.id}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message = Array.isArray(result?.message) ? result.message.join(' ') : result?.message;
      throw new Error(message ?? 'Bölüm eklenemedi.');
    }

    setSections(result);
    setCreatingType(null);
  }

  async function handleUpdate(sectionId: string, data: Record<string, unknown>) {
    const response = await fetch(`/api/pages/${page.id}/sections/${sectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message = Array.isArray(result?.message) ? result.message.join(' ') : result?.message;
      throw new Error(message ?? 'Bölüm güncellenemedi.');
    }

    setSections(result);
    setEditingId(null);
  }

  async function handleDelete(sectionId: string) {
    setError('');

    try {
      const response = await fetch(`/api/pages/${page.id}/sections/${sectionId}`, { method: 'DELETE' });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? 'Bölüm silinemedi.');
      }

      setSections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bölüm silinemedi.');
    }
  }

  async function handleMove(sectionId: string, direction: 'up' | 'down') {
    if (!sections) {
      return;
    }

    const index = sections.findIndex((section) => section.id === sectionId);
    const otherIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || otherIndex < 0 || otherIndex >= sections.length) {
      return;
    }

    const current = sections[index];
    const other = sections[otherIndex];
    setError('');

    try {
      const response = await fetch(`/api/pages/${page.id}/sections/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: current.id, sortOrder: other.sortOrder },
            { id: other.id, sortOrder: current.sortOrder },
          ],
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? 'Sıralama güncellenemedi.');
      }

      setSections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sıralama güncellenemedi.');
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-sm font-semibold text-white">Sayfa Bölümleri</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Sayfanızı hazır bloklardan oluşturun. Hiç bölüm eklemezseniz yukarıdaki İçerik alanı kullanılır.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {sections === null ? (
          <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-6 py-10 text-sm text-zinc-500">
            Yükleniyor...
          </div>
        ) : sections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-8 text-center text-sm text-zinc-500">
            Henüz bölüm eklenmedi.
          </div>
        ) : (
          sections.map((section, index) => (
            <SectionRow
              key={section.id}
              section={section}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
              isEditing={editingId === section.id}
              onMove={(direction) => handleMove(section.id, direction)}
              onEdit={() => setEditingId(section.id)}
              onCancelEdit={() => setEditingId(null)}
              onSave={(data) => handleUpdate(section.id, data)}
              onDelete={() => handleDelete(section.id)}
            />
          ))
        )}
      </div>

      <div className="mt-5 border-t border-zinc-800 pt-5">
        <p className="mb-2.5 text-xs font-medium text-zinc-400">Bölüm Ekle</p>
        <div className="flex flex-wrap gap-2">
          {SECTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCreatingType(type)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-indigo-500 hover:text-white"
            >
              + {SECTION_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {creatingType && (
          <div className="mt-4 rounded-xl border border-indigo-900/50 bg-zinc-950 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-400">
              Yeni {SECTION_TYPE_LABELS[creatingType]} Bölümü
            </p>
            <SectionEditor
              type={creatingType}
              initialData={{}}
              onCancel={() => setCreatingType(null)}
              onSave={(data) => handleCreate(creatingType, data)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
