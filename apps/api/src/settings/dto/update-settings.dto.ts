import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
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
