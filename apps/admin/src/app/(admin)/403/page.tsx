import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-20 text-center">
      <p className="text-sm font-semibold text-red-400">403</p>
      <h1 className="mt-2 text-2xl font-semibold text-white">Bu sayfaya erişim yetkiniz yok</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        Hesabınızın rolü bu bölüme erişim için yeterli değil. İhtiyacınız varsa yöneticinizle iletişime
        geçin.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
      >
        Panele Dön
      </Link>
    </div>
  );
}
