'use client';

import { FormEvent, useEffect, useState } from 'react';

import type { ManagedUser, UserRole } from '@/lib/api';
import { formatDate } from '@/lib/format';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Süper Yönetici' },
  { value: 'ADMIN', label: 'Yönetici' },
  { value: 'EDITOR', label: 'Editör' },
  { value: 'AUTHOR', label: 'Yazar' },
];

function displayName(user: ManagedUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name.length > 0 ? name : user.email;
}

export function UserManager() {
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('AUTHOR');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers() {
    setError('');

    try {
      const response = await fetch('/api/users', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Kullanıcılar yüklenemedi.');
      }

      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcılar yüklenemedi.');
      setUsers([]);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName.trim().length > 0 ? firstName : undefined,
          lastName: lastName.trim().length > 0 ? lastName : undefined,
          role,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Bu e-posta zaten kullanılıyor.');
        }
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message ?? 'Kullanıcı oluşturulamadı.');
      }

      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('AUTHOR');
      await loadUsers();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı.');
    } finally {
      setCreating(false);
    }
  }

  async function updateUser(id: string, payload: Record<string, unknown>) {
    setPendingId(id);
    setError('');

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? 'Kullanıcı güncellenemedi.');
      }

      setUsers((prev) => prev?.map((user) => (user.id === id ? (data as ManagedUser) : user)) ?? prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı güncellenemedi.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-semibold text-white">Yeni Kullanıcı</h2>
        <p className="mt-1 text-xs text-zinc-500">
          E-posta ve geçici bir şifre belirleyerek yeni bir kullanıcı oluşturun.
        </p>

        {createError && (
          <div className="mt-3 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-posta"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Şifre (en az 8 karakter)"
            required
            minLength={8}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Ad"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Soyad"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={creating}
              className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? '...' : '+ Ekle'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-semibold text-white">Kullanıcılar</h2>

        {error && (
          <div className="mt-3 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-4 divide-y divide-zinc-800/60">
          {users === null ? (
            <p className="py-4 text-sm text-zinc-500">Yükleniyor...</p>
          ) : users.length === 0 ? (
            <p className="py-4 text-sm text-zinc-500">Henüz kullanıcı yok.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-[160px]">
                  <p className="text-sm font-medium text-white">{displayName(user)}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-600">Katılım: {formatDate(user.createdAt)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={user.role}
                    onChange={(event) => updateUser(user.id, { role: event.target.value })}
                    disabled={pendingId === user.id}
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-60"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                    disabled={pendingId === user.id}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      user.isActive
                        ? 'border-emerald-900 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-950'
                        : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
