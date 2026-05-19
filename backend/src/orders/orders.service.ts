import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { orders } from '../db/schema/orders';
import { tickets } from '../db/schema/tickets';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  constructor(@Inject('DRIZZLE') private db: any) {}

  async simulateCheckout(userId: number, dto: CreateOrderDto) {
    // Usamos uma transação: ou grava tudo com sucesso, ou cancela tudo em caso de erro!
    return await this.db.transaction(async (tx) => {
      // 1. Criar a Order
      const [newOrder] = await tx.insert(orders).values({
        userId,
        eventId: dto.eventId,
        quantity: dto.quantity,
        totalPrice: dto.totalPrice,
        status: 'paid', // Checkout mágico do projeto final!
        paymentReference: 'SIM-CHECKOUT-' + Date.now(),
      }).returning();

      // 2. Criar os Bilhetes (Tickets)
      const ticketsToCreate = Array.from({ length: dto.quantity }).map(() => ({
        userId,
        eventId: dto.eventId,
        orderId: newOrder.id,
        qrCode: crypto.randomUUID(), // O código único para o QR
        status: 'active',
      }));

      await tx.insert(tickets).values(ticketsToCreate);

      return { 
        success: true, 
        message: 'Compra efetuada com sucesso! Bilhetes gerados.', 
        order: newOrder 
      };
    });
  }
}