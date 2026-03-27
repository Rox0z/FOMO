import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';

export class CreateEventDto {

  @ApiProperty({ example: "Tech Conference" })
  @IsString()
  name: string;

  @ApiProperty({ example: "Annual technology conference" })
  @IsString()
  description: string;

  @ApiProperty({ example: "2026-06-20T10:00:00Z" })
  @IsDateString()
  date: string;

  @ApiProperty({ example: "Lisbon" })
  @IsString()
  location: string;

}