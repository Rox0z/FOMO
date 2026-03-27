import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateEventDto {

  @ApiPropertyOptional({ example: "Tech Conference" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "Annual technology conference" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "2026-06-20T10:00:00Z" })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: "Lisbon" })
  @IsOptional()
  @IsString()
  location?: string;

}