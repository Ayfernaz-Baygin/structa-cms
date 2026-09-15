import { LocaleQueryDto } from '../../translations/locale.dto.js';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

import { MenuItemTarget } from '../../generated/prisma/enums.js';

export class CreateMenuItemDto extends LocaleQueryDto {
  @IsString()
  @MinLength(1)
  label: string;

  @IsString()
  @MinLength(1)
  url: string;

  @IsOptional()
  @IsEnum(MenuItemTarget)
  target?: MenuItemTarget;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
