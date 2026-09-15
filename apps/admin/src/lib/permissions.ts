export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';

const CONTENT_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];
const ADMIN_MANAGEMENT_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN'];
const BLOG_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'];
const MEDIA_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'];

interface RoutePermission {
  prefix: string;
  roles: Role[];
}

/**
 * Route-prefix → allowed-roles map for the admin UI (sidebar visibility and
 * proxy-level route guarding). Mirrors the backend's @Roles() guards in
 * apps/api/src/**\/*.controller.ts — keep both in sync when permissions change.
 * Routes with no matching rule (e.g. /dashboard) are open to any logged-in user.
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { prefix: '/audit-logs', roles: ADMIN_MANAGEMENT_ROLES },
  { prefix: '/pages', roles: CONTENT_ROLES },
  { prefix: '/services', roles: CONTENT_ROLES },
  { prefix: '/projects', roles: CONTENT_ROLES },
  { prefix: '/blog', roles: BLOG_ROLES },
  { prefix: '/media', roles: MEDIA_ROLES },
  { prefix: '/menus', roles: ADMIN_MANAGEMENT_ROLES },
  { prefix: '/settings', roles: ADMIN_MANAGEMENT_ROLES },
  { prefix: '/users', roles: ['SUPER_ADMIN'] },
];

export function isRouteAllowed(pathname: string, role: string): boolean {
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  const rule = ROUTE_PERMISSIONS.find(
    (permission) => pathname === permission.prefix || pathname.startsWith(`${permission.prefix}/`),
  );

  if (!rule) {
    return true;
  }

  return rule.roles.includes(role as Role);
}
