import { IsArray, IsNumber, IsNotEmpty, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: 1, description: 'Event ID' })
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @ApiProperty({ example: 2, description: 'Quantity of tickets to purchase' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'The minimum quantity is 1 ticket.' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto], description: 'List of items to process at checkout' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}