import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants.js';
import { lastValueFrom, of, throwError } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor.js';
import { AuditService } from './audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuditQueryDto } from './audit-query.dto.js';


function run(controller: string, route: string, method: string, result: unknown, body = {}, params = {}, failed = false) {
  class Target {}
  const handler = () => {};
  Reflect.defineMetadata(PATH_METADATA, controller, Target);
  Reflect.defineMetadata(PATH_METADATA, route, handler);
  const record = vi.fn().mockResolvedValue({});
  const interceptor = new AuditInterceptor({ record } as unknown as AuditService);
  const context = { getClass: () => Target, getHandler: () => handler,
    switchToHttp: () => ({ getRequest: () => ({ method, body, params, user: { sub: 'actor' } }) }),
  } as unknown as ExecutionContext;
  return { record, promise: lastValueFrom(interceptor.intercept(context, { handle: () => failed ? throwError(() => new Error('failed')) : of(result) })) };
}

describe('Audit regression', () => {
  it.each(['pages', 'services', 'projects', 'posts', 'media', 'menus'])('records CRUD for %s', async (controller) => {
    for (const [method, action] of [['POST', 'CREATE'], ['PATCH', 'UPDATE'], ['DELETE', 'DELETE']]) {
      const { record, promise } = run(controller, ':id', method, method === 'DELETE' ? undefined : { id: 'entity' }, {}, { id: 'entity' });
      await promise;
      expect(record).toHaveBeenCalledWith('actor', action, expect.any(String), 'entity', undefined);
    }
  });
  it.each(['pages', 'services', 'projects', 'posts'])('records publishing %s', async controller => {
    const { record, promise } = run(controller, ':id', 'PATCH', { id: 'entity', status: 'PUBLISHED' }, { status: 'PUBLISHED' });
    await promise;
    expect(record).toHaveBeenLastCalledWith('actor', 'PUBLISH', expect.any(String), 'entity');
  });
  it('records settings and nested mutations against their parent', async () => {
    for (const [controller, route, result, params, id] of [
      ['settings', '/', { id: 'singleton' }, {}, 'singleton'],
      ['pages', ':pageId/sections', [], { pageId: 'page' }, 'page'],
      ['menus', ':id/items', { id: 'menu', items: [] }, { id: 'menu' }, 'menu'],
      ['projects', ':id/images', { id: 'project', images: [] }, { id: 'project' }, 'project'],
      ['pages', ':pageId/sections/reorder', [], { pageId: 'page' }, 'page'],
    ] as const) {
      const { record, promise } = run(controller, route, 'PATCH', result, {}, params);
      await promise;
      expect(record).toHaveBeenCalledWith('actor', 'UPDATE', expect.any(String), id, undefined);
    }
  });
  it('records restore once with its revision identifier', async () => {
    const { record, promise } = run('pages', ':id/revisions/:revisionId/restore', 'POST', { id: 'page', status: 'PUBLISHED' }, {}, { id: 'page', revisionId: 'revision' });
    await promise;
    expect(record).toHaveBeenCalledExactlyOnceWith('actor', 'RESTORE', 'Page', 'page', { revisionId: 'revision' });
  });
  it('never copies credentials or login response into logs', async () => {
    const { record, promise } = run('auth', 'login', 'POST', { user: { id: 'actor', passwordHash: 'secret' }, accessToken: 'jwt' }, { password: 'secret' });
    await promise;
    expect(record).toHaveBeenCalledExactlyOnceWith('actor', 'LOGIN', 'User', 'actor', undefined);
  });
  it('does not log failed mutations or reads', async () => {
    const failed = run('pages', '/', 'POST', {}, {}, {}, true);
    await expect(failed.promise).rejects.toThrow('failed');
    expect(failed.record).not.toHaveBeenCalled();
    const read = run('pages', '/', 'GET', []);
    await read.promise;
    expect(read.record).not.toHaveBeenCalled();
  });
  it('allowlists metadata at the shared service boundary', async () => {
    const create = vi.fn().mockResolvedValue({});
    const service = new AuditService({ auditLog: { create } } as unknown as PrismaService);
    await service.record('actor', 'LOGIN', 'User', 'actor', { password: 'secret', passwordHash: 'hash', JWT: 'token', nested: { token: 'secret' } } as never);
    expect(create.mock.calls[0][0].data.metadata).toBeUndefined();
  });
  it.each([{ page: '0' }, { page: '1.5' }, { limit: '101' }, { action: 'INVALID' }, { entityType: 'INVALID' }])('rejects invalid query %j', async input => {
    expect((await validate(plainToInstance(AuditQueryDto, input))).length).toBeGreaterThan(0);
  });
});

describe('Admin audit route permissions', () => {
  let isRouteAllowed: (path: string, role: string) => boolean;
  beforeAll(async () => {
    const modulePath = new URL('../../../admin/src/lib/permissions.ts', import.meta.url).href;
    ({ isRouteAllowed } = await import(modulePath));
  });
  it.each(['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'AUTHOR'])('guards navigation and direct access for %s', role => {
    expect(isRouteAllowed('/audit-logs', role)).toBe(['ADMIN', 'SUPER_ADMIN'].includes(role));
    expect(isRouteAllowed('/audit-logs/details', role)).toBe(['ADMIN', 'SUPER_ADMIN'].includes(role));
    expect(isRouteAllowed('/blog', role)).toBe(true);
  });
});
