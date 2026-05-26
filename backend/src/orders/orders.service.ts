import { Injectable, Inject, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { orders } from '../db/schema/orders';
import { tickets } from '../db/schema/tickets';
import { events } from '../db/schema/events';
import { eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  constructor(@Inject('DRIZZLE') private db: any) {}

  async simulateCheckout(userId: number, dto: CreateOrderDto) {
    return await this.db.transaction(async (tx) => {
      // 1. Lock the event row and verify it exists and is approved.
      // `FOR UPDATE` serializes concurrent checkouts for the same event,
      // preventing two requests from seeing the same remaining capacity.
      const [event] = await tx
        .select()
        .from(events)
        .where(and(eq(events.id, dto.eventId), eq(events.status, 'approved')))
        .for('update')
        .limit(1);

      if (!event) {
        throw new NotFoundException('Evento não encontrado ou não está disponível.');
      }

      // 2. Enforce capacity — prevent overbooking
      const remaining = event.maxCapacity - event.ticketsSold;
      if (dto.quantity > remaining) {
        throw new ConflictException(
          `Apenas ${remaining} bilhete(s) disponível(eis) para este evento.`,
        );
      }

      // 3. Prevent duplicate orders — one active order per user per event
      const existingOrder = await tx.query.orders.findFirst({
        where: and(
          eq(orders.userId, userId),
          eq(orders.eventId, dto.eventId),
          eq(orders.status, 'paid'),
        ),
      });

      if (existingOrder) {
        throw new ConflictException('Já tens bilhetes para este evento.');
      }

      // 4. Server-side price calculation — never trust client totalPrice
      const ticketPrice = Number(event.ticketPrice);
      const totalPrice = Math.round(ticketPrice * dto.quantity * 100); // stored in cents

      // 5. Create the Order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId,
          eventId: dto.eventId,
          quantity: dto.quantity,
          totalPrice,
          status: 'paid',
          paymentReference: 'SIM-CHECKOUT-' + Date.now(),
        })
        .returning();

      // 6. Create Tickets
      const ticketsToCreate = Array.from({ length: dto.quantity }).map(() => ({
        userId,
        eventId: dto.eventId,
        orderId: newOrder.id,
        qrCode: crypto.randomUUID(),
        status: 'active',
      }));

      await tx.insert(tickets).values(ticketsToCreate);

      // 7. Increment ticketsSold on the event
      await tx
        .update(events)
        .set({ ticketsSold: event.ticketsSold + dto.quantity })
        .where(eq(events.id, dto.eventId));

      return {
        success: true,
        message: 'Compra efetuada com sucesso! Bilhetes gerados.',
        order: newOrder,
      };
    });
  }
}
