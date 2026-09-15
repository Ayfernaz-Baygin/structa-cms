import { Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module.js';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PagesModule } from './pages/pages.module.js';
import { ServicesModule } from './services/services.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { PostsModule } from './posts/posts.module.js';
import { MediaModule } from './media/media.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { MenusModule } from './menus/menus.module.js';
import { PublicModule } from './public/public.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuditModule,
    UsersModule,
    AuthModule,
    PagesModule,
    ServicesModule,
    ProjectsModule,
    PostsModule,
    MediaModule,
    SettingsModule,
    MenusModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
