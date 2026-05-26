import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: "FOMO Rooftop Opening" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "O melhor sunset do Algarve com DJs internacionais." })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: "Lisbon" })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: "2026-06-20" })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: "23:30" })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 18.0 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 200 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  maxCapacity: number;
}