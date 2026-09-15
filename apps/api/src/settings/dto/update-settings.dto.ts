import { IsEmail, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

// logoUrl/faviconUrl can be picked from the Media Library, which stores a
// backend-relative path (e.g. "/uploads/images/x.jpg") rather than a full
// URL — so these two accept either an absolute URL or a leading-slash path.
const RELATIVE_OR_ABSOLUTE_URL = /^(https?:\/\/\S+|\/\S+)$/;
const RELATIVE_OR_ABSOLUTE_URL_MESSAGE = 'Geçerli bir URL veya /uploads/... yolu giriniz.';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsString()
  @Matches(RELATIVE_OR_ABSOLUTE_URL, { message: RELATIVE_OR_ABSOLUTE_URL_MESSAGE })
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(RELATIVE_OR_ABSOLUTE_URL, { message: RELATIVE_OR_ABSOLUTE_URL_MESSAGE })
  faviconUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @IsOptional()
  @IsUrl()
  xUrl?: string;

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsUrl()
  googleMapsUrl?: string;

  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;
}
