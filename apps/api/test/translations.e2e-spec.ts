import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Multi-language V1 HTTP regression', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let authorToken: string;
  let userId: string;
  const created: { route: string; id: string }[] = [];
  const http = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });
  async function create(route: string, data: object) {
    const response = await http()
      .post(`/${route}`)
      .set(auth())
      .send(data)
      .expect(201);
    created.push({ route, id: response.body.id });
    return response.body;
  }
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
    const user = await prisma.user.create({
      data: {
        email: `locale-${randomUUID()}@example.test`,
        passwordHash: 'unused-test-fixture',
        role: 'ADMIN',
      },
    });
    userId = user.id;
    const jwt = app.get(JwtService);
    token = await jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: 'ADMIN',
    });
    authorToken = await jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: 'AUTHOR',
    });
  });
  afterAll(async () => {
    for (const entry of created)
      await http().delete(`/${entry.route}/${entry.id}`).set(auth());
    if (userId) {
      await prisma.auditLog.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    }
    await app.close();
    await prisma.$disconnect();
  });
  it.each(['pages', 'services', 'projects', 'posts'])(
    '%s: locale CRUD, fallback, shared status, slug constraints and audit',
    async (route) => {
      const slug = `locale-${randomUUID()}`;
      const bodyField =
        route === 'pages'
          ? 'body'
          : route === 'posts'
            ? 'content'
            : 'description';
      const row = await create(route, {
        title: 'TR original',
        slug,
        [bodyField]: 'TR content',
        seoTitle: 'TR SEO',
      });
      expect(row.translations).toHaveLength(1);
      expect(row.translations[0].locale).toBe('tr');
      await http().get(`/public/${route}/${slug}?locale=en`).expect(404);
      await http()
        .patch(`/${route}/${row.id}`)
        .set(auth())
        .send({ status: 'PUBLISHED' })
        .expect(200);
      const fallback = await http()
        .get(`/public/${route}/${slug}?locale=en`)
        .expect(200);
      expect(fallback.body).toMatchObject({
        id: row.id,
        title: 'TR original',
        locale: 'en',
        translationLocale: 'tr',
      });
      await http()
        .patch(`/${route}/${row.id}`)
        .set(auth())
        .send({
          locale: 'en',
          title: 'EN original',
          slug: `${slug}-en`,
          [bodyField]: 'EN content',
          seoTitle: 'EN SEO',
        })
        .expect(200);
      await http()
        .patch(`/${route}/${row.id}`)
        .set(auth())
        .send({ locale: 'en', title: 'EN edited', [bodyField]: '' })
        .expect(200);
      const en = await http()
        .get(`/${route}/${row.id}?locale=en`)
        .set(auth())
        .expect(200);
      expect(en.body).toMatchObject({
        title: 'EN edited',
        seoTitle: 'EN SEO',
        [bodyField]: '',
        status: 'PUBLISHED',
      });
      const tr = await http()
        .get(`/${route}/${row.id}?locale=tr`)
        .set(auth())
        .expect(200);
      expect(tr.body).toMatchObject({
        title: 'TR original',
        [bodyField]: 'TR content',
        seoTitle: 'TR SEO',
      });
      await http().get(`/public/${route}/${slug}-en?locale=en`).expect(200);
      await http().get(`/public/${route}/${slug}-en?locale=tr`).expect(404);
      await http().get(`/public/${route}/${slug}?locale=en`).expect(404);
      await http()
        .patch(`/${route}/${row.id}`)
        .set(auth())
        .send({ locale: 'tr', title: 'TR edited' })
        .expect(200);
      const sameSlugOtherLocale = await create(route, {
        locale: 'en',
        title: 'EN same slug',
        slug,
        status: 'PUBLISHED',
      });
      const exact = await http()
        .get(`/public/${route}/${slug}?locale=en`)
        .expect(200);
      expect(exact.body.id).toBe(sameSlugOtherLocale.id);
      await http()
        .post(`/${route}`)
        .set(auth())
        .send({ locale: 'en', title: 'Duplicate', slug })
        .expect(409);
      await http()
        .patch(`/${route}/${row.id}`)
        .set(auth())
        .send({ locale: 'en', slug })
        .expect(409);
      await http().get(`/public/${route}/${slug}?locale=tr`).expect(200);
      await http()
        .patch(`/${route}/${row.id}`)
        .set(auth())
        .send({ locale: 'en', status: 'DRAFT' })
        .expect(200);
      await http().get(`/public/${route}/${slug}?locale=tr`).expect(404);
      await http().get(`/public/${route}/${slug}-en?locale=en`).expect(404);
      if (route !== 'pages') {
        const list = await http().get(`/public/${route}?locale=en`).expect(200);
        expect(
          list.body.some((item: { id: string }) => item.id === row.id),
        ).toBe(false);
        expect(
          list.body.find(
            (item: { id: string }) => item.id === sameSlugOtherLocale.id,
          )?.title,
        ).toBe('EN same slug');
        const trList = await http()
          .get(`/public/${route}?locale=tr`)
          .expect(200);
        expect(
          trList.body.some(
            (item: { id: string }) => item.id === sameSlugOtherLocale.id,
          ),
        ).toBe(false);
      }
      const logs = await prisma.auditLog.findMany({
        where: { entityId: row.id },
      });
      expect(logs.map((log) => log.action)).toEqual(
        expect.arrayContaining(['CREATE', 'UPDATE', 'PUBLISH']),
      );
      expect(logs.every((log) => log.userId === userId)).toBe(true);
    },
  );
  it('requested locale wins over a competing TR fallback slug', async () => {
    const slug = `priority-${randomUUID()}`;
    await create('services', {
      locale: 'tr',
      title: 'Fallback',
      slug,
      status: 'PUBLISHED',
    });
    const exact = await create('services', {
      locale: 'en',
      title: 'Exact EN',
      slug,
      status: 'PUBLISHED',
    });
    const response = await http()
      .get(`/public/services/${slug}?locale=en`)
      .expect(200);
    expect(response.body.id).toBe(exact.id);
  });
  it('restores both translations and shared sections, including pre-migration revisions', async () => {
    const slug = `revision-${randomUUID()}`;
    const page = await create('pages', {
      title: 'TR before',
      slug,
      body: 'TR body',
      status: 'PUBLISHED',
    });
    await http()
      .post(`/pages/${page.id}/sections`)
      .set(auth())
      .send({ type: 'TEXT', data: { body: 'Shared section' } })
      .expect(201);
    await http()
      .patch(`/pages/${page.id}`)
      .set(auth())
      .send({
        locale: 'en',
        title: 'EN before',
        slug: `${slug}-en`,
        body: 'EN body',
      })
      .expect(200);
    await http()
      .patch(`/pages/${page.id}`)
      .set(auth())
      .send({ locale: 'en', title: 'EN after' })
      .expect(200);
    const revision = await prisma.pageRevision.findFirstOrThrow({
      where: { pageId: page.id },
      orderBy: { createdAt: 'desc' },
    });
    await http()
      .post(`/pages/${page.id}/revisions/${revision.id}/restore`)
      .set(auth())
      .expect(201);
    const en = await http()
      .get(`/public/pages/${slug}-en?locale=en`)
      .expect(200);
    expect(en.body.title).toBe('EN before');
    expect(en.body.sections[0].data.body).toBe('Shared section');
    const tr = await http().get(`/public/pages/${slug}?locale=tr`).expect(200);
    expect(tr.body.title).toBe('TR before');
    const legacy = await prisma.pageRevision.create({
      data: {
        pageId: page.id,
        title: 'Legacy TR',
        slug,
        status: 'PUBLISHED',
        body: 'Legacy body',
      },
    });
    await http()
      .post(`/pages/${page.id}/revisions/${legacy.id}/restore`)
      .set(auth())
      .expect(201);
    const restored = await http()
      .get(`/public/pages/${slug}?locale=tr`)
      .expect(200);
    expect(restored.body.title).toBe('Legacy TR');
    const preserved = await http()
      .get(`/public/pages/${slug}-en?locale=en`)
      .expect(200);
    expect(preserved.body.title).toBe('EN before');
  });
  it('rejects invalid locales and incomplete new translations', async () => {
    const row = await create('services', {
      title: 'TR',
      slug: `validation-${randomUUID()}`,
    });
    for (const locale of ['de', '', null, ['tr']]) {
      await http()
        .patch(`/services/${row.id}`)
        .set(auth())
        .send({ locale, title: 'Invalid' })
        .expect(400);
    }
    await http()
      .patch(`/services/${row.id}`)
      .set(auth())
      .send({ locale: 'en', description: 'Missing title and slug' })
      .expect(400);
    await http().get('/public/services?locale=de').expect(400);
    await http().get('/services?locale=de').set(auth()).expect(400);
    await http().get('/public/pages/test?locale=de').expect(400);
  });
  it('preserves AUTHOR RBAC and ownership', async () => {
    await http()
      .post('/pages')
      .auth(authorToken, { type: 'bearer' })
      .send({ locale: 'en', title: 'Forbidden', slug: 'forbidden' })
      .expect(403);
    const post = await create('posts', {
      title: 'Post',
      slug: `author-${randomUUID()}`,
    });
    await http()
      .patch(`/posts/${post.id}`)
      .auth(authorToken, { type: 'bearer' })
      .send({
        locale: 'en',
        title: 'EN',
        slug: `en-${post.slug}`,
        status: 'PUBLISHED',
      })
      .expect(403);
    const foreignToken = await app
      .get(JwtService)
      .signAsync({
        sub: randomUUID(),
        email: 'foreign@example.test',
        role: 'AUTHOR',
      });
    await http()
      .get(`/posts/${post.id}?locale=en`)
      .auth(foreignToken, { type: 'bearer' })
      .expect(403);
  });
});
