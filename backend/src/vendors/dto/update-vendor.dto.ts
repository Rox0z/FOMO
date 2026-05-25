import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateVendorProfileDto {
  @ApiPropertyOptional({ example: 'Tech Solutions Inc.' })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ example: 'A leading tech company...' })
  @IsString()
  @IsOptional()
  businessDescription?: string;
}