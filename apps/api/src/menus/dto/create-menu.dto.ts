import { IsEnum, IsString, MinLength } from 'class-validator';

import { MenuLocation } from '../../generated/prisma/enums.js';

export class CreateMenuDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(MenuLocation)
  location: MenuLocation;
}
