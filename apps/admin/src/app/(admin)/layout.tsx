import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { AdminShell } from '@/components/admin-shell';
import type { AuthUser } from '@/lib/api';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const userHeader = headerList.get('x-structa-user');

  if (!userHeader) {
    redirect('/login');
  }

  const user = JSON.parse(userHeader) as AuthUser;

  return <AdminShell user={user}>{children}</AdminShell>;
}
