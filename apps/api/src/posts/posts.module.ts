import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PostCategoriesController } from './post-categories.controller.js';
import { PostCategoriesService } from './post-categories.service.js';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PostsController, PostCategoriesController],
  providers: [PostsService, PostCategoriesService],
})
export class PostsModule {}
