import { UserManager } from '@/components/user-manager';

export default function UsersPage() {
  return (
    <div>
      <p className="text-sm font-medium text-indigo-400">Structa CMS</p>
      <h1 className="mt-2 text-3xl font-semibold">Kullanıcılar</h1>
      <p className="mt-2 text-zinc-400">Kullanıcıları listeleyin, oluşturun, rollerini ve durumlarını yönetin.</p>

      <div className="mt-8">
        <UserManager />
      </div>
    </div>
  );
}
