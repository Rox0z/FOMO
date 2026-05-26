import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @UseGuards(JwtGuard)
  checkout(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    // Passamos o ID do utilizador logado e os dados da encomenda
    return this.ordersService.simulateCheckout(user.id, createOrderDto);
  }
}