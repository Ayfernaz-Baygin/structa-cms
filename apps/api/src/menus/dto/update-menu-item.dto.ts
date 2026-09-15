import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

import { MenuItemTarget } from '../../generated/prisma/enums.js';

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  url?: string;

  @IsOptional()
  @IsEnum(MenuItemTarget)
  target?: MenuItemTarget;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
