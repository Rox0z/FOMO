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
      
      // Criamos acumuladores globais para consolidar o e-mail no final do checkout
      const allQrCodeBuffers: Buffer[] = [];
      const eventNames: string[] = [];
      let grandTotal = 0;
      let totalQuantity = 0;
      let referenceOrderId = 0;
      const QRCode = require('qrcode');

      // [BOA PRÁTICA]: Ordenar os itens por eventId para evitar Deadlocks na BD sob concorrência
      const sortedItems = dto.items.sort((a, b) => a.eventId - b.eventId);

      // Iteramos cirurgicamente sobre cada item enviado do carrinho
      for (const item of sortedItems) {
        
        // Procurar o evento dentro da transação para obter os valores mais recentes e evitar Race Conditions
        const event = await tx.query.events.findFirst({
          where: eq(events.id, item.eventId),
        });

        if (!event) {
          throw new NotFoundException(`O evento com ID ${item.eventId} não foi encontrado.`);
        }

        const availableTickets = event.maxCapacity - event.ticketsSold;
        if (item.quantity > availableTickets) {
          throw new BadRequestException(
            `Lotação esgotada ou insuficiente para o evento "${event.name}". Disponíveis: ${availableTickets}, solicitados: ${item.quantity}.`
          );
        }

        const calculatedTotal = event.ticketPrice * item.quantity;
        
        // Acumular totais globais
        grandTotal += calculatedTotal;
        totalQuantity += item.quantity;
        eventNames.push(event.name);

        // 1. Criar a ordem de compra para este evento específico
        const [newOrder] = await tx
          .insert(orders)
          .values({
            userId,
            eventId: item.eventId,
            quantity: item.quantity,
            totalPrice: calculatedTotal,
            status: 'paid',
            paymentReference: 'SIM-' + Date.now() + '-' + item.eventId,
          })
          .returning();

        // Guardamos o ID da primeira ordem apenas como referência visual para o e-mail original
        if (referenceOrderId === 0) {
          referenceOrderId = newOrder.id;
        }

        // 2. Gerar os registos individuais de ingressos no banco de dados
        const ticketsToCreate = Array.from({ length: item.quantity }).map(() => ({
          userId,
          eventId: item.eventId,
          orderId: newOrder.id,
          qrCode: crypto.randomUUID(),
          status: 'active',
        }));

        const insertedTickets = await tx
          .insert(tickets)
          .values(ticketsToCreate)
          .returning();

        // 3. Incrementar o contador de ticketsSold diretamente no Evento correspondente
        await tx
          .update(events)
          .set({
            ticketsSold: event.ticketsSold + item.quantity,
          })
          .where(eq(events.id, item.eventId));

        // 4. Gerar e acumular os buffers dos QR Codes deste evento específico
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
          allQrCodeBuffers.push(buffer);
        }
      }

      // 5. Enviar um único email de confirmação agregado com todos os QR Codes gerados
      if (buyer?.email && sortedItems.length > 0) {
        this.emailsService.sendOrderConfirmation(
          buyer.email,
          buyer.name,
          referenceOrderId,
          grandTotal,
          totalQuantity,
          eventNames.join(', '), // Ex: "Rock in Rio, Web Summit"
          allQrCodeBuffers
        );
      }

      // Retorna uma resposta amigável com sucesso
      return {
        success: true,
        message: 'Checkout processado com sucesso!',
      };
    });
  }
}