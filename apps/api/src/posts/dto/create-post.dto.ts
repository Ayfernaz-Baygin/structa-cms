import { IsEnum, IsOptional, IsString, IsUUID, Matches, MinLength } from 'class-validator';

import { ContentStatus } from '../../generated/prisma/enums.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'slug yalnızca küçük harf, rakam ve tire (-) içerebilir.',
  })
  slug: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string | null;
}
