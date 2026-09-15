import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { MenusController } from './menus.controller.js';
import { MenusService } from './menus.service.js';

@Module({
  imports: [AuthModule],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
