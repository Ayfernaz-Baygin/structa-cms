import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants.js';
import { concatMap } from 'rxjs';
import { AuditAction } from '../generated/prisma/enums.js';
import { AuditService } from './audit.service.js';

const ENTITIES: Record<string, string> = { pages: 'Page', services: 'Service', projects: 'Project', posts: 'Post', media: 'Media', settings: 'Settings', menus: 'Menu' };

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const controller = Reflect.getMetadata(PATH_METADATA, context.getClass()) as string;
    const route = Reflect.getMetadata(PATH_METADATA, context.getHandler()) as string;
    const req = context.switchToHttp().getRequest();
    const login = controller === 'auth' && route === 'login' && req.method === 'POST';
    if (!login && (!ENTITIES[controller] || !['POST', 'PATCH', 'DELETE'].includes(req.method))) return next.handle();

    return next.handle().pipe(concatMap(async (result) => {
      const userId = login ? result.user.id : req.user.sub;
      const entityType = login ? 'User' : ENTITIES[controller];
      const params = req.params;
      let entityId = login ? userId : (result?.id ?? params.id ?? params.pageId ?? 'singleton');
      const nested = /sections|items|images/.test(route);
      if (nested) entityId = params.pageId ?? params.id;
      const restore = route.endsWith('/restore');
      const action: AuditAction = login ? 'LOGIN' : restore ? 'RESTORE' : nested ? 'UPDATE' : req.method === 'DELETE' ? 'DELETE' : req.method === 'POST' ? 'CREATE' : 'UPDATE';
      await this.audit.record(userId, action, entityType, entityId, restore ? { revisionId: params.revisionId } : undefined);
      // A successful explicit publish command is recorded alongside its create/update.
      if (!login && !restore && req.body?.status === 'PUBLISHED' && result?.status === 'PUBLISHED') {
        await this.audit.record(userId, 'PUBLISH', entityType, entityId);
      }
      return result;
    }));
  }
}
