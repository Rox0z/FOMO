import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  countryCode?: string;

  @ApiProperty({ example: "Tech Solutions Inc." })
  @IsOptional()
  businessName?: string;

  @ApiProperty({ example: "A leading tech company..." })
  @IsOptional()
  businessDescription?: string;
}