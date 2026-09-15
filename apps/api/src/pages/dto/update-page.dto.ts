import { LocaleQueryDto } from '../../translations/locale.dto.js';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { PageStatus } from '../../generated/prisma/enums.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class UpdatePageDto extends LocaleQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'slug yalnızca küçük harf, rakam ve tire (-) içerebilir.',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;
}
