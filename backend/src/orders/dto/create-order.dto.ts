import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsNumber()
  eventId: number;

  @ApiProperty()  
  @IsNumber()
  @Min(1)
  quantity: number;
}