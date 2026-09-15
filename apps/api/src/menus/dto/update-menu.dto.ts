import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { MenuLocation } from '../../generated/prisma/enums.js';

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEnum(MenuLocation)
  location?: MenuLocation;
}
