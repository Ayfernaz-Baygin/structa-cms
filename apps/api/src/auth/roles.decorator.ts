import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../generated/prisma/enums.js';

export const ROLES_KEY = 'roles';

/**
 * Marks a controller or handler as requiring one of the given roles.
 * Combine with RolesGuard (after JwtAuthGuard) to enforce it — SUPER_ADMIN
 * always passes regardless of the roles listed here.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
