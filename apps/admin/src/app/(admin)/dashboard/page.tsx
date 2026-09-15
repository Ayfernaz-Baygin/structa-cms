'use client';

import { useEffect, useState } from 'react';

interface StatCard {
  key: 'pages' | 'posts' | 'projects' | 'media';
  label: string;
  path: string;
}

const STAT_CARDS: StatCard[] = [
  { key: 'pages', label: 'Sayfalar', path: '/api/pages' },
  { key: 'posts', label: 'Blog Yazıları', path: '/api/posts' },
  { key: 'projects', label: 'Projeler', path: '/api/projects' },
  { key: 'media', label: 'Medya', path: '/api/media?limit=1' },
];

type Counts = Partial<Record<StatCard['key'], number | null>>;

async function fetchCount(card: StatCard): Promise<number | null> {
  try {
    const response = await fetch(card.path, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    // /api/media is paginated ({ items, pagination: { total } }); the rest return plain arrays.
    if (card.key === 'media') {
      return typeof data?.pagination?.total === 'number' ? data.pagination.total : null;
    }
    return Array.isArray(data) ? data.length : null;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const results = await Promise.all(STAT_CARDS.map((card) => fetchCount(card)));

      if (cancelled) {
        return;
      }

      setCounts(Object.fromEntries(STAT_CARDS.map((card, index) => [card.key, results[index]])));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>

      <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>

      <p className="mt-4 text-zinc-400">
        Structa CMS yönetim paneline hoş geldiniz.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const count = counts[card.key];
          return (
            <div
              key={card.key}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-zinc-400">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {loading ? '…' : (count ?? '—')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
