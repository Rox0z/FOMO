import { IsArray, IsNumber, IsNotEmpty, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID do Evento' })
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @ApiProperty({ example: 2, description: 'Quantidade de bilhetes a adquirir' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'A quantidade mínima é 1 bilhete.' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto], description: 'Lista de itens a processar no checkout' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}