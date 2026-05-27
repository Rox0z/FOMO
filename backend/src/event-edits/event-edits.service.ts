import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { eventEdits } from '../db/schema/event.edits';
import { events } from '../db/schema/events';
import { vendorProfiles } from '../db/schema/vendorProfiles';
import { LogsService } from '../logs/logs.service';
import type { DrizzleDB } from '../drizzle';

@Injectable()
export class EventEditsService {
  constructor(
    @Inject('DRIZZLE') private db: DrizzleDB,
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
      throw new ForbiddenException('Commercial profile of Vendor not found.');
    }

    const currentEvent = await this.db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.vendorId, vendorProfile.id)),
    });

    if (!currentEvent) {
      throw new NotFoundException('Event not found or not mapped to your profile.');
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
      message: 'Changes saved and submitted for review successfully.',
      data: newEditRequest[0]
    };
  }

  // ---------------------------------------------------------
  // 2. USADO PELO ADMIN: Aprovar o Pedido
  // ---------------------------------------------------------
  async approveEditRequest(editId: number, admin: any) {
    const editRequest = await this.db.query.eventEdits.findFirst({
      where: eq(eventEdits.id, editId),
    });

    if (!editRequest) {
      throw new NotFoundException('The edit request was not found.');
    }

    if (editRequest.status !== 'pending') {
      throw new BadRequestException('This request for modification has already been evaluated.');
    }

    // Aplicar no evento principal
    await this.db
      .update(events)
      .set({
        name: editRequest.name,
        description: editRequest.description,
        location: editRequest.location,
        date: editRequest.date,
        ticketPrice: editRequest.ticketPrice as any,
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

    const adminIdentifier = admin?.name || admin?.email || 'Undefined Admin ';

    await this.logsService.createLog(
      `Approved structural updates for Event ID: ${editRequest.eventId} ("${editRequest.name}")`,adminIdentifier
    );

    return { success: true, message: 'Changes approved successfully.' };
  }

  // ---------------------------------------------------------
  // 3. USADO PELO ADMIN: Rejeitar o Pedido
  // ---------------------------------------------------------
  async rejectEditRequest(editId: number, admin: any) {
    const editRequest = await this.db.query.eventEdits.findFirst({
      where: eq(eventEdits.id, editId),
    });

    if (!editRequest) {
      throw new NotFoundException('The edit request was not found.');
    }

    if (editRequest.status !== 'pending') {
      throw new BadRequestException('This request for modification has already been evaluated.');
    }

    await this.db
      .update(eventEdits)
      .set({ status: 'rejected' })
      .where(eq(eventEdits.id, editId));

    const adminIdentifier = admin?.name || admin?.email || 'Undefined Admin ';

    await this.logsService.createLog(
      `Rejected modification updates for Event ID: ${editRequest.eventId} ("${editRequest.name}")`,adminIdentifier
    );

    return { success: true, message: 'Edit request securely rejected.' };
  }
}