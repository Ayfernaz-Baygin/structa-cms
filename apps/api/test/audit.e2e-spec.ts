import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

// Isolated fixtures only; no existing content or settings are mutated.
describe('Audit HTTP regression', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let userId: string;
  let email: string;
  let token: string;
  const created: { route: string; id: string }[] = [];
  const password = randomUUID();
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    jwt = app.get(JwtService);
    email = `audit-test-${randomUUID()}@example.test`;
    const user = await prisma.user.create({
      data: { email, passwordHash: await argon2.hash(password), role: 'ADMIN' },
    });
    userId = user.id;
    token = await jwt.signAsync({ sub: userId, email, role: 'ADMIN' });
  });
  afterAll(async () => {
    for (const entry of created)
      await request(app.getHttpServer())
        .delete(`/${entry.route}/${entry.id}`)
        .auth(token, { type: 'bearer' });
    if (userId) {
      await prisma.auditLog.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
    await app.close();
  });
  it.each(['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'AUTHOR'])(
    'enforces %s access',
    async (role) => {
      const roleToken = await jwt.signAsync({ sub: userId, email, role });
      await request(app.getHttpServer())
        .get('/audit-logs')
        .auth(roleToken, { type: 'bearer' })
        .expect(['ADMIN', 'SUPER_ADMIN'].includes(role) ? 200 : 403);
    },
  );
  it('requires authentication and validates filters', async () => {
    await request(app.getHttpServer()).get('/audit-logs').expect(401);
    for (const query of [
      'page=0',
      'limit=101',
      'action=BAD',
      'entityType=BAD',
    ]) {
      await request(app.getHttpServer())
        .get(`/audit-logs?${query}`)
        .auth(token, { type: 'bearer' })
        .expect(400);
    }
  });
  it('logs only successful logins without secrets', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
    expect(
      await prisma.auditLog.count({ where: { userId, action: 'LOGIN' } }),
    ).toBe(0);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const logs = await prisma.auditLog.findMany({
      where: { userId, action: 'LOGIN' },
    });
    expect(logs).toHaveLength(1);
    expect(logs[0].metadata).toBeNull();
    expect(JSON.stringify(logs)).not.toContain(password);
  });
  it.each(['pages', 'services', 'projects', 'posts'])(
    'audits %s lifecycle and preserves revisions',
    async (route) => {
      const http = request(app.getHttpServer());
      const response = await http
        .post(`/${route}`)
        .auth(token, { type: 'bearer' })
        .send({ title: 'Audit fixture', slug: `audit-${randomUUID()}` })
        .expect(201);
      const id = response.body.id;
      created.push({ route, id });
      await http
        .patch(`/${route}/${id}`)
        .auth(token, { type: 'bearer' })
        .send({ status: 'PUBLISHED' })
        .expect(200);
      if (route === 'pages') {
        const revisions = await http
          .get(`/pages/${id}/revisions`)
          .auth(token, { type: 'bearer' })
          .expect(200);
        await http
          .post(`/pages/${id}/revisions/${revisions.body[0].id}/restore`)
          .auth(token, { type: 'bearer' })
          .send({})
          .expect(201);
        const restored = await prisma.auditLog.findFirst({
          where: { entityId: id, action: 'RESTORE' },
        });
        expect(restored?.metadata).toEqual({
          revisionId: revisions.body[0].id,
        });
      }
      await http
        .delete(`/${route}/${id}`)
        .auth(token, { type: 'bearer' })
        .expect(204);
      created.splice(
        created.findIndex((x) => x.id === id),
        1,
      );
      const logs = await prisma.auditLog.findMany({ where: { entityId: id } });
      expect(logs.map((x) => x.action)).toEqual(
        expect.arrayContaining(['CREATE', 'UPDATE', 'PUBLISH', 'DELETE']),
      );
      expect(logs.every((x) => x.userId === userId)).toBe(true);
    },
  );
  it('filters, paginates, and omits user password hashes', async () => {
    const result = await request(app.getHttpServer())
      .get('/audit-logs?action=DELETE&entityType=Page&limit=1&page=1')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(result.body.items).toHaveLength(1);
    expect(result.body.items[0]).toMatchObject({
      action: 'DELETE',
      entityType: 'Page',
    });
    expect(result.body).toMatchObject({ page: 1, limit: 1 });
    expect(JSON.stringify(result.body)).not.toMatch(
      /password|passwordHash|accessToken|JWT/,
    );
  });
});
