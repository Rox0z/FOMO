import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { eventEdits } from '../db/schema/event.edits';
import { events } from '../db/schema/events';
import { vendorProfiles } from '../db/schema/vendorProfiles';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class EventEditsService {
  constructor(
    @Inject('DRIZZLE') private db: any,
    private logsService: LogsService,
  ) {}

  // ---------------------------------------------------------
  // 1. USADO PELO VENDOR: Criar o Pedido de Edição
  // ---------------------------------------------------------
  async createEditRequest(eventId: number, dto: any, userId: number, bannerUrl: string) {
    const vendorProfile = await this.db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.userId, userId),
    });

    if (!vendorProfile) {
      throw new ForbiddenException('Perfil comercial de Vendor não encontrado.');
    }

    const currentEvent = await this.db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.vendorId, vendorProfile.id)),
    });

    if (!currentEvent) {
      throw new NotFoundException('Evento não encontrado ou não está mapeado no seu perfil.');
    }

    const combinedDateTime = new Date(`${dto.date}T${dto.time}`);
    const priceValue = dto.price !== undefined ? String(Number(dto.price).toFixed(2)) : '0.00';
    const capacityValue = dto.maxCapacity !== undefined ? Number(dto.maxCapacity) : 100;

    const newEditRequest = await this.db
      .insert(eventEdits)
      .values({
        eventId: eventId,
        name: dto.name || currentEvent.name,
        description: dto.description || currentEvent.description,
        location: dto.location || currentEvent.location,
        date: combinedDateTime,
        ticketPrice: priceValue,
        maxCapacity: capacityValue,
        bannerUrl: (bannerUrl !== '') ? bannerUrl : currentEvent.bannerUrl,
        status: 'pending'
      })
      .returning();

    return {
      success: true,
      message: 'Alterações guardadas e submetidas para auditoria com sucesso.',
      data: newEditRequest[0]
    };
  }

  // ---------------------------------------------------------
  // 2. USADO PELO ADMIN: Aprovar o Pedido
  // ---------------------------------------------------------
  async approveEditRequest(editId: number) {
    const editRequest = await this.db.query.eventEdits.findFirst({
      where: eq(eventEdits.id, editId),
    });

    if (!editRequest) {
      throw new NotFoundException('O pedido de alteração não foi encontrado.');
    }

    if (editRequest.status !== 'pending') {
      throw new BadRequestException('Este pedido de modificação já foi avaliado.');
    }

    // Aplicar no evento principal
    await this.db
      .update(events)
      .set({
        name: editRequest.name,
        description: editRequest.description,
        location: editRequest.location,
        date: editRequest.date,
        ticketPrice: editRequest.ticketPrice,
        maxCapacity: editRequest.maxCapacity,
        bannerUrl: editRequest.bannerUrl,
        updatedAt: new Date(),
      })
      .where(eq(events.id, editRequest.eventId));

    // Fechar o estado do request
    await this.db
      .update(eventEdits)
      .set({ status: 'approved' })
      .where(eq(eventEdits.id, editId));

    await this.logsService.createLog(
      `Approved structural updates for Event ID: ${editRequest.eventId} ("${editRequest.name}")`
    );

    return { success: true, message: 'Alterações homologadas com sucesso.' };
  }

  // ---------------------------------------------------------
  // 3. USADO PELO ADMIN: Rejeitar o Pedido
  // ---------------------------------------------------------
  async rejectEditRequest(editId: number) {
    const editRequest = await this.db.query.eventEdits.findFirst({
      where: eq(eventEdits.id, editId),
    });

    if (!editRequest) {
      throw new NotFoundException('O pedido de alteração não foi encontrado.');
    }

    if (editRequest.status !== 'pending') {
      throw new BadRequestException('Este pedido de modificação já foi avaliado.');
    }

    await this.db
      .update(eventEdits)
      .set({ status: 'rejected' })
      .where(eq(eventEdits.id, editId));

    await this.logsService.createLog(
      `Rejected modification updates for Event ID: ${editRequest.eventId} ("${editRequest.name}")`
    );

    return { success: true, message: 'Pedido de alteração rejeitado de forma segura.' };
  }
}