import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ProjectCategoriesController } from './project-categories.controller.js';
import { ProjectCategoriesService } from './project-categories.service.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ProjectsController, ProjectCategoriesController],
  providers: [ProjectsService, ProjectCategoriesService],
})
export class ProjectsModule {}
