import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { UPLOADS_ROOT } from './media/media-storage.js';

function getCorsOrigins(): string[] {
  const configuredOrigins = process.env.CORS_ORIGINS;

  if (configuredOrigins) {
    return configuredOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('CORS_ORIGINS must be defined in production.');
  }

  return ['http://localhost:3001'];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: getCorsOrigins(),
    credentials: true,
  });

  app.useStaticAssets(UPLOADS_ROOT, {
    prefix: '/uploads/',
  });

  await app.listen(Number(process.env.PORT ?? 4000), process.env.HOST ?? '0.0.0.0');
}

bootstrap();
