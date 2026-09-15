import Link from 'next/link';
import { redirect } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/server-api';

const actions = ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'RESTORE', 'LOGIN'];
const entities = ['Page', 'Service', 'Project', 'Post', 'Media', 'Settings', 'Menu', 'User'];
interface AuditResult {
  items: { id: string; userId: string | null; action: string; entityType: string; entityId: string; metadata: unknown; createdAt: string; user: { email: string } | null }[];
  total: number; page: number; totalPages: number;
}
export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const token = await getAuthToken();
  if (!token) redirect('/login');
  const params = await searchParams;
  const action = typeof params.action === 'string' && actions.includes(params.action) ? params.action : '';
  const entityType = typeof params.entityType === 'string' && entities.includes(params.entityType) ? params.entityType : '';
  const rawPage = Number(params.page);
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 1000000 ? rawPage : 1;
  const query = new URLSearchParams({ page: String(page), limit: '20' });
  if (action) query.set('action', action);
  if (entityType) query.set('entityType', entityType);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/audit-logs?${query}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  } catch {
    return <p role="alert">İşlem kayıtları yüklenemedi. Lütfen tekrar deneyin.</p>;
  }
  if (response.status === 401) redirect('/login');
  if (response.status === 403) redirect('/403');
  if (!response.ok) return <p role="alert">İşlem kayıtları yüklenemedi. Lütfen tekrar deneyin.</p>;
  const data: AuditResult = await response.json();
  const pageUrl = (target: number) => { const q = new URLSearchParams(query); q.set('page', String(target)); return `/audit-logs?${q}`; };
  return <div>
    <h1 className="text-3xl font-semibold">İşlem Geçmişi</h1>
    <form key={`${action}:${entityType}`} className="my-6 flex flex-wrap items-end gap-4" action="/audit-logs">
      <label className="grid gap-2">İşlem<select name="action" defaultValue={action} className="rounded border border-zinc-700 bg-zinc-900 p-2"><option value="">Tümü</option>{actions.map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="grid gap-2">Varlık türü<select name="entityType" defaultValue={entityType} className="rounded border border-zinc-700 bg-zinc-900 p-2"><option value="">Tümü</option>{entities.map(x => <option key={x}>{x}</option>)}</select></label>
      <button className="rounded bg-indigo-600 px-4 py-2">Filtrele</button>
      <Link href="/audit-logs" className="p-2 text-indigo-300">Temizle</Link>
    </form>
    <p className="mb-4 text-zinc-400">{data.total} kayıt</p>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <thead><tr>{['Tarih', 'Kullanıcı', 'İşlem', 'Varlık', 'Varlık kimliği', 'Detay'].map(x => <th key={x} className="border-b border-zinc-700 p-3">{x}</th>)}</tr></thead>
      <tbody>{data.items.map(log => <tr key={log.id}>
        <td className="p-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}</td>
        <td className="p-3">{log.user?.email ?? log.userId ?? 'Silinmiş kullanıcı'}</td><td className="p-3">{log.action}</td><td className="p-3">{log.entityType}</td><td className="p-3 break-all">{log.entityId}</td><td className="p-3 break-all">{log.metadata ? JSON.stringify(log.metadata) : '—'}</td>
      </tr>)}</tbody>
    </table></div>
    {data.items.length === 0 && <p className="py-8 text-zinc-400">Kayıt bulunamadı.</p>}
    <nav aria-label="Sayfalama" className="mt-6 flex gap-6">
      {page > 1 && <Link href={pageUrl(page - 1)}>Önceki</Link>}
      <span>Sayfa {page} / {Math.max(1, data.totalPages)}</span>
      {page < data.totalPages && <Link href={pageUrl(page + 1)}>Sonraki</Link>}
    </nav>
  </div>;
}
