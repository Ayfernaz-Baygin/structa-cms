'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import type { Page, SiteSettings } from '@/lib/api';
import { MediaPicker } from '@/components/media-picker';
import { LocaleTabs } from '@/components/locale-tabs';
import type { Locale } from '@/lib/content-translations';

type SharedFormState = Record<
  | 'logoUrl'
  | 'faviconUrl'
  | 'email'
  | 'phone'
  | 'instagramUrl'
  | 'facebookUrl'
  | 'linkedinUrl'
  | 'youtubeUrl'
  | 'xUrl'
  | 'googleMapsUrl'
  | 'googleAnalyticsId',
  string
>;

type TranslatedFormState = Record<'siteName' | 'siteDescription' | 'footerText' | 'address', string>;

const EMPTY_SHARED_FORM: SharedFormState = {
  logoUrl: '',
  faviconUrl: '',
  email: '',
  phone: '',
  instagramUrl: '',
  facebookUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  xUrl: '',
  googleMapsUrl: '',
  googleAnalyticsId: '',
};

const EMPTY_TRANSLATED_FORM: TranslatedFormState = {
  siteName: '',
  siteDescription: '',
  footerText: '',
  address: '',
};

function toSharedForm(settings: SiteSettings): SharedFormState {
  return {
    logoUrl: settings.logoUrl ?? '',
    faviconUrl: settings.faviconUrl ?? '',
    email: settings.email ?? '',
    phone: settings.phone ?? '',
    instagramUrl: settings.instagramUrl ?? '',
    facebookUrl: settings.facebookUrl ?? '',
    linkedinUrl: settings.linkedinUrl ?? '',
    youtubeUrl: settings.youtubeUrl ?? '',
    xUrl: settings.xUrl ?? '',
    googleMapsUrl: settings.googleMapsUrl ?? '',
    googleAnalyticsId: settings.googleAnalyticsId ?? '',
  };
}

function toTranslatedDrafts(settings: SiteSettings): Record<Locale, TranslatedFormState> {
  const read = (locale: Locale): TranslatedFormState => {
    const translation = settings.translations?.find((t) => t.locale === locale);
    // Falls back to the top-level (tr-mirrored) fields for tr when no translations array is present yet.
    const fallback = locale === 'tr' ? settings : undefined;
    return {
      siteName: translation?.siteName ?? fallback?.siteName ?? '',
      siteDescription: translation?.siteDescription ?? fallback?.siteDescription ?? '',
      footerText: translation?.footerText ?? fallback?.footerText ?? '',
      address: translation?.address ?? fallback?.address ?? '',
    };
  };
  return { tr: read('tr'), en: read('en') };
}

function trimmedOrUndefined(value: string) {
  return value.trim().length > 0 ? value.trim() : undefined;
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
  id: string;
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

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {action}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [sharedForm, setSharedForm] = useState<SharedFormState>(EMPTY_SHARED_FORM);
  const [translated, setTranslated] = useState<Record<Locale, TranslatedFormState>>({
    tr: EMPTY_TRANSLATED_FORM,
    en: EMPTY_TRANSLATED_FORM,
  });
  const [locale, setLocale] = useState<Locale>('tr');
  const dirtyLocales = useRef(new Set<Locale>());
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

      setSharedForm(toSharedForm(data));
      setTranslated(toTranslatedDrafts(data));
      dirtyLocales.current.clear();
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

  function updateShared(field: keyof SharedFormState, value: string) {
    setSharedForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  function updateTranslated(field: keyof TranslatedFormState, value: string) {
    dirtyLocales.current.add(locale);
    setTranslated((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
    setSuccess(false);
  }

  async function patchSettings(body: Record<string, unknown>) {
    const response = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
      throw new Error(message ?? 'Ayarlar kaydedilemedi.');
    }
    return data;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    dirtyLocales.current.add(locale);

    const sharedPayload = Object.fromEntries(
      Object.entries(sharedForm).map(([key, value]) => [key, trimmedOrUndefined(value)]),
    );

    try {
      await patchSettings({
        ...sharedPayload,
        homePageId: homePageId.length > 0 ? homePageId : null,
        locale,
        siteName: trimmedOrUndefined(translated[locale].siteName),
        siteDescription: trimmedOrUndefined(translated[locale].siteDescription),
        footerText: trimmedOrUndefined(translated[locale].footerText),
        address: trimmedOrUndefined(translated[locale].address),
      });
      dirtyLocales.current.delete(locale);

      const otherLocale: Locale = locale === 'tr' ? 'en' : 'tr';
      if (dirtyLocales.current.has(otherLocale)) {
        await patchSettings({
          locale: otherLocale,
          siteName: trimmedOrUndefined(translated[otherLocale].siteName),
          siteDescription: trimmedOrUndefined(translated[otherLocale].siteDescription),
          footerText: trimmedOrUndefined(translated[otherLocale].footerText),
          address: trimmedOrUndefined(translated[otherLocale].address),
        });
        dirtyLocales.current.delete(otherLocale);
      }

      await loadSettings();
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
          <Section
            title="Genel"
            action={<LocaleTabs locale={locale} onChange={setLocale} disabled={saving} />}
          >
            <Field
              id="siteName"
              label="Site Adı"
              value={translated[locale].siteName}
              onChange={(v) => updateTranslated('siteName', v)}
            />
            <Field
              id="siteDescription"
              label="Site Açıklaması"
              value={translated[locale].siteDescription}
              onChange={(v) => updateTranslated('siteDescription', v)}
              textarea
            />
            <MediaPicker
              label="Logo"
              value={sharedForm.logoUrl}
              onChange={(v) => updateShared('logoUrl', v)}
              accept="image"
            />
            <MediaPicker
              label="Favicon"
              value={sharedForm.faviconUrl}
              onChange={(v) => updateShared('faviconUrl', v)}
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

          <Section
            title="İletişim"
            action={<LocaleTabs locale={locale} onChange={setLocale} disabled={saving} />}
          >
            <Field id="email" label="E-posta" type="email" value={sharedForm.email} onChange={(v) => updateShared('email', v)} />
            <Field id="phone" label="Telefon" value={sharedForm.phone} onChange={(v) => updateShared('phone', v)} />
            <Field
              id="address"
              label="Adres"
              value={translated[locale].address}
              onChange={(v) => updateTranslated('address', v)}
              textarea
            />
            <Field
              id="googleMapsUrl"
              label="Google Maps URL"
              value={sharedForm.googleMapsUrl}
              onChange={(v) => updateShared('googleMapsUrl', v)}
              placeholder="https://..."
            />
          </Section>

          <Section title="Sosyal Medya">
            <Field
              id="instagramUrl"
              label="Instagram"
              value={sharedForm.instagramUrl}
              onChange={(v) => updateShared('instagramUrl', v)}
              placeholder="https://instagram.com/..."
            />
            <Field
              id="facebookUrl"
              label="Facebook"
              value={sharedForm.facebookUrl}
              onChange={(v) => updateShared('facebookUrl', v)}
              placeholder="https://facebook.com/..."
            />
            <Field
              id="linkedinUrl"
              label="LinkedIn"
              value={sharedForm.linkedinUrl}
              onChange={(v) => updateShared('linkedinUrl', v)}
              placeholder="https://linkedin.com/..."
            />
            <Field
              id="youtubeUrl"
              label="YouTube"
              value={sharedForm.youtubeUrl}
              onChange={(v) => updateShared('youtubeUrl', v)}
              placeholder="https://youtube.com/..."
            />
            <Field
              id="xUrl"
              label="X"
              value={sharedForm.xUrl}
              onChange={(v) => updateShared('xUrl', v)}
              placeholder="https://x.com/..."
            />
          </Section>

          <Section
            title="Footer"
            action={<LocaleTabs locale={locale} onChange={setLocale} disabled={saving} />}
          >
            <Field
              id="footerText"
              label="Footer Metni"
              value={translated[locale].footerText}
              onChange={(v) => updateTranslated('footerText', v)}
              textarea
            />
          </Section>

          <Section title="Analytics">
            <Field
              id="googleAnalyticsId"
              label="Google Analytics ID"
              value={sharedForm.googleAnalyticsId}
              onChange={(v) => updateShared('googleAnalyticsId', v)}
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
