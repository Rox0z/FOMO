import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { orders } from '../db/schema/orders';
import { tickets } from '../db/schema/tickets';
import { events } from 'src/db/schema/events';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import type { DrizzleDB } from '../drizzle';
import { EmailsService } from '../services/emails/emails.service';
import { users } from 'src/db/schema/users';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('DRIZZLE') private db: DrizzleDB, 
    private emailsService: EmailsService
  ) {}

  async simulateCheckout(userId: number, dto: CreateOrderDto) {

    const buyer = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Usamos uma transação: ou grava tudo com sucesso, ou cancela tudo em caso de erro!
    return await this.db.transaction(async (tx) => {
      
      //Procurar o evento dentro da transação para obter os valores mais recentes e evitar Race Conditions
      const event = await tx.query.events.findFirst({
        where: eq(events.id, dto.eventId),
      });

      if (!event) {
        throw new NotFoundException('Evento não encontrado');
      }

      //Validar a capacidade e verificar se há overbooking
      const availableTickets = event.maxCapacity - event.ticketsSold;
      
      if (dto.quantity > availableTickets) {
        throw new BadRequestException(
          `Lotação esgotada ou insuficiente. Lugares disponíveis: ${availableTickets}. Quantidade solicitada: ${dto.quantity}.`
        );
      }

      const calculatedTotal = event.ticketPrice * dto.quantity;

      //Criar a Ordem de Compra (Order)
      const [newOrder] = await tx.insert(orders).values({
        userId,
        eventId: dto.eventId,
        quantity: dto.quantity,
        totalPrice: calculatedTotal,
        status: 'paid',
        paymentReference: 'SIM-CHECKOUT-' + Date.now(),
      }).returning();

      // Criar os Bilhetes (Tickets) individuais correspondentes à quantidade comprada
      const ticketsToCreate = Array.from({ length: dto.quantity }).map(() => ({
        userId,
        eventId: dto.eventId,
        orderId: newOrder.id,
        qrCode: crypto.randomUUID(), // O código único para o QR
        status: 'active',
      }));

      const insertedTickets = await tx
        .insert(tickets)
        .values(ticketsToCreate)
        .returning();

      // Incrementar o contador de ticketsSold diretamente no Evento correspondente
      await tx
        .update(events)
        .set({
          ticketsSold: event.ticketsSold + dto.quantity,
        })
        .where(eq(events.id, dto.eventId));

      // 6. Enviar email de confirmação para o usuário
      if(buyer?.email) {
        const QRCode = require('qrcode');
        const qrCodeBuffers: Buffer[] = [];

        const orderedTicketsForEmail = insertedTickets.sort((a, b) => a.id - b.id);

        for (const ticket of orderedTicketsForEmail) {
          const qrCodeText = ticket.qrCode;
          const buffer = await QRCode.toBuffer(qrCodeText, {
            type: 'png',
            margin: 4,
            errorCorrectionLevel: 'L',
            version: 3,
            width: 150,
            color: {
              dark: '#1a0b2e',
              light: '#ffffff',
            }
        });
          qrCodeBuffers.push(buffer);
        }

        this.emailsService.sendOrderConfirmation(
          buyer.email,
          buyer.name,
          newOrder.id,
          calculatedTotal,
          dto.quantity,
          event.name,
          qrCodeBuffers
        );
      }
      // Retorna a ordem de compra preenchida juntamente com uma mensagem informativa de sucesso
      return {
        ...newOrder,
        message: 'Reserva efetuada com sucesso e contador de capacidade atualizado!',
      };
    });
  }
}