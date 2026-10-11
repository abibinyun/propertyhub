import { IsOptional, IsString } from 'class-validator';

export class SubmitVerificationDto {
  @IsOptional()
  @IsString()
  idCardNumber?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  idCardUrl?: string;

  @IsOptional()
  @IsString()
  brokerCertificateUrl?: string;
}
