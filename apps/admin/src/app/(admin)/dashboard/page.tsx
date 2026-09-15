interface StatCard {
  label: string;
  value: number;
}

const STATS: StatCard[] = [
  { label: 'Sayfalar', value: 12 },
  { label: 'Blog Yazıları', value: 34 },
  { label: 'Projeler', value: 8 },
  { label: 'Medya', value: 156 },
];

export default function DashboardPage() {
  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>

      <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>

      <p className="mt-4 text-zinc-400">
        Structa CMS yönetim paneline hoş geldiniz.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
