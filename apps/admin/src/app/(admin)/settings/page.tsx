'use client';

import { FormEvent, useEffect, useState } from 'react';

import type { Page, SiteSettings } from '@/lib/api';
import { MediaPicker } from '@/components/media-picker';

type FormState = Record<
  | 'siteName'
  | 'siteDescription'
  | 'logoUrl'
  | 'faviconUrl'
  | 'email'
  | 'phone'
  | 'address'
  | 'instagramUrl'
  | 'facebookUrl'
  | 'linkedinUrl'
  | 'youtubeUrl'
  | 'xUrl'
  | 'footerText'
  | 'googleMapsUrl'
  | 'googleAnalyticsId',
  string
>;

const EMPTY_FORM: FormState = {
  siteName: '',
  siteDescription: '',
  logoUrl: '',
  faviconUrl: '',
  email: '',
  phone: '',
  address: '',
  instagramUrl: '',
  facebookUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  xUrl: '',
  footerText: '',
  googleMapsUrl: '',
  googleAnalyticsId: '',
};

function toFormState(settings: SiteSettings): FormState {
  return {
    siteName: settings.siteName ?? '',
    siteDescription: settings.siteDescription ?? '',
    logoUrl: settings.logoUrl ?? '',
    faviconUrl: settings.faviconUrl ?? '',
    email: settings.email ?? '',
    phone: settings.phone ?? '',
    address: settings.address ?? '',
    instagramUrl: settings.instagramUrl ?? '',
    facebookUrl: settings.facebookUrl ?? '',
    linkedinUrl: settings.linkedinUrl ?? '',
    youtubeUrl: settings.youtubeUrl ?? '',
    xUrl: settings.xUrl ?? '',
    footerText: settings.footerText ?? '',
    googleMapsUrl: settings.googleMapsUrl ?? '',
    googleAnalyticsId: settings.googleAnalyticsId ?? '',
  };
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  textarea = false,
  placeholder,
}: {
  id: keyof FormState;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [homePageId, setHomePageId] = useState('');
  const [pages, setPages] = useState<Page[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const publishedPages = pages?.filter((page) => page.status === 'PUBLISHED') ?? [];

  useEffect(() => {
    void loadSettings();
    void loadPages();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/settings', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Ayarlar yüklenemedi.');
      }

      setForm(toFormState(data));
      setHomePageId((data as SiteSettings).homePageId ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ayarlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  async function loadPages() {
    try {
      const response = await fetch('/api/pages', { cache: 'no-store' });
      const data = await response.json();
      setPages(response.ok ? data : []);
    } catch {
      setPages([]);
    }
  }

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const payload = {
      ...Object.fromEntries(
        Object.entries(form).map(([key, value]) => [
          key,
          value.trim().length > 0 ? value.trim() : undefined,
        ]),
      ),
      homePageId: homePageId.length > 0 ? homePageId : null,
    };

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message ?? 'Ayarlar kaydedilemedi.');
      }

      setForm(toFormState(data));
      setHomePageId((data as SiteSettings).homePageId ?? '');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
      <h1 className="mt-2 text-3xl font-semibold">Ayarlar</h1>
      <p className="mt-2 text-zinc-400">Site genel ayarlarını, iletişim bilgilerini ve entegrasyonları yönetin.</p>

      {loading ? (
        <div className="mt-8 flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-sm text-zinc-500">
          Yükleniyor...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Section title="Genel">
            <Field id="siteName" label="Site Adı" value={form.siteName} onChange={(v) => update('siteName', v)} />
            <Field
              id="siteDescription"
              label="Site Açıklaması"
              value={form.siteDescription}
              onChange={(v) => update('siteDescription', v)}
              textarea
            />
            <MediaPicker
              label="Logo"
              value={form.logoUrl}
              onChange={(v) => update('logoUrl', v)}
              accept="image"
            />
            <MediaPicker
              label="Favicon"
              value={form.faviconUrl}
              onChange={(v) => update('faviconUrl', v)}
              accept="image"
            />
          </Section>

          <Section title="Ana Sayfa">
            <div className="sm:col-span-2">
              <label htmlFor="homePageId" className="mb-2 block text-sm font-medium text-zinc-300">
                Ana Sayfa Olarak Kullanılacak Sayfa
              </label>
              <select
                id="homePageId"
                value={homePageId}
                onChange={(event) => {
                  setHomePageId(event.target.value);
                  setSuccess(false);
                }}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              >
                <option value="">Sabit Ana Sayfa (Varsayılan)</option>
                {publishedPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-zinc-500">
                Seçilen sayfa Page Builder bölümlerine sahipse, site ana sayfasında (/) o sayfa gösterilir.
                Yalnızca yayında (PUBLISHED) sayfalar seçilebilir. Sayfa silinir veya taslağa alınırsa mevcut
                sabit ana sayfa otomatik olarak devreye girer.
              </p>
              {pages !== null && publishedPages.length === 0 && (
                <p className="mt-2 text-xs text-zinc-500">
                  Yayında bir sayfa yok. Ana sayfa olarak seçebilmek için önce Sayfalar ekranından bir sayfayı
                  yayınlayın.
                </p>
              )}
            </div>
          </Section>

          <Section title="İletişim">
            <Field id="email" label="E-posta" type="email" value={form.email} onChange={(v) => update('email', v)} />
            <Field id="phone" label="Telefon" value={form.phone} onChange={(v) => update('phone', v)} />
            <Field id="address" label="Adres" value={form.address} onChange={(v) => update('address', v)} textarea />
            <Field
              id="googleMapsUrl"
              label="Google Maps URL"
              value={form.googleMapsUrl}
              onChange={(v) => update('googleMapsUrl', v)}
              placeholder="https://..."
            />
          </Section>

          <Section title="Sosyal Medya">
            <Field
              id="instagramUrl"
              label="Instagram"
              value={form.instagramUrl}
              onChange={(v) => update('instagramUrl', v)}
              placeholder="https://instagram.com/..."
            />
            <Field
              id="facebookUrl"
              label="Facebook"
              value={form.facebookUrl}
              onChange={(v) => update('facebookUrl', v)}
              placeholder="https://facebook.com/..."
            />
            <Field
              id="linkedinUrl"
              label="LinkedIn"
              value={form.linkedinUrl}
              onChange={(v) => update('linkedinUrl', v)}
              placeholder="https://linkedin.com/..."
            />
            <Field
              id="youtubeUrl"
              label="YouTube"
              value={form.youtubeUrl}
              onChange={(v) => update('youtubeUrl', v)}
              placeholder="https://youtube.com/..."
            />
            <Field
              id="xUrl"
              label="X"
              value={form.xUrl}
              onChange={(v) => update('xUrl', v)}
              placeholder="https://x.com/..."
            />
          </Section>

          <Section title="Footer">
            <Field
              id="footerText"
              label="Footer Metni"
              value={form.footerText}
              onChange={(v) => update('footerText', v)}
              textarea
            />
          </Section>

          <Section title="Analytics">
            <Field
              id="googleAnalyticsId"
              label="Google Analytics ID"
              value={form.googleAnalyticsId}
              onChange={(v) => update('googleAnalyticsId', v)}
              placeholder="G-XXXXXXXXXX"
            />
          </Section>

          {error && (
            <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-900 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
              Ayarlar başarıyla kaydedildi.
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
