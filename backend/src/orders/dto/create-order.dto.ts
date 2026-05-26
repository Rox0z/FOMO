import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsNumber()
  eventId: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(10) // Reasonable per-order limit
  quantity: number;
}
