import { IsEnum, ValidateIf } from 'class-validator';
import { Locale } from '../generated/prisma/enums.js';

export class LocaleQueryDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(Locale)
  locale?: Locale;
}
