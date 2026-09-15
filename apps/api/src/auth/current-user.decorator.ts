import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { UserRole } from '../generated/prisma/enums.js';

export interface CurrentUserPayload {
  sub: string;
  email: string;
  role: UserRole;
}

interface AuthenticatedRequest extends Request {
  user: CurrentUserPayload;
}

/** Reads the JWT payload that JwtAuthGuard already attached to the request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
