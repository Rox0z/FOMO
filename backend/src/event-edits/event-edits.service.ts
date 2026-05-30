import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { eventEdits } from '../db/schema/event.edits';
import { events } from '../db/schema/events';
import { vendorProfiles } from '../db/schema/vendorProfiles';
import { users } from '../db/schema/users'; 
import { LogsService } from '../logs/logs.service';
import { EmailsService } from '../services/emails/emails.service';
import type { DrizzleDB } from '../drizzle';
import { ImagesService } from '../services/images/images.service';

@Injectable()
export class EventEditsService {
  constructor(
    @Inject('DRIZZLE') private db: DrizzleDB,
    private logsService: LogsService,
    private imagesService: ImagesService,
    private emailsService: EmailsService, 
  ) {}

  // ---------------------------------------------------------
  // 1. USADO PELO VENDOR: Criar o Pedido de Edição
  // ---------------------------------------------------------
  async createEditRequest(eventId: number, dto: any, userId: number, file?: Express.Multer.File) {
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
      throw new NotFoundException('Event not found or not owned by you.');
    }

    let finalBannerUrl = currentEvent.bannerUrl;
    if (file) {
      finalBannerUrl = await this.imagesService.uploadImage(file);
    }

    const [newRequest] = await this.db
      .insert(eventEdits)
      .values({
        eventId: eventId,
        name: dto.name || currentEvent.name,
        description: dto.description || currentEvent.description,
        date: dto.date ? new Date(dto.date) : currentEvent.date,
        location: dto.location || currentEvent.location,
        ticketPrice: dto.ticketPrice || currentEvent.ticketPrice,
        maxCapacity: dto.maxCapacity ? Number(dto.maxCapacity) : currentEvent.maxCapacity,
        bannerUrl: finalBannerUrl,
        status: 'pending',
      })
      .returning();

    return {
      success: true,
      message: 'Pedido de alteração submetido com sucesso e aguarda homologação do Administrador.',
      data: newRequest,
    };
  }

  // ---------------------------------------------------------
  // 2. USADO PELO ADMIN: Aprovar o Pedido e Aplicar no Evento Real
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

    // Buscar o evento original antes do update para sabermos quem é o Vendor dono dele
    const originalEvent = await this.db.query.events.findFirst({
      where: eq(events.id, editRequest.eventId),
    });

    // Transferir os dados estruturais homologados para a tabela principal de eventos
    await this.db
      .update(events)
      .set({
        name: editRequest.name,
        description: editRequest.description,
        date: editRequest.date,
        location: editRequest.location,
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
      `Approved structural updates for Event ID: ${editRequest.eventId} (\"${editRequest.name}\")`, adminIdentifier
    );

    // 🌟 ENVIAR EMAIL EM BACKGROUND AO VENDOR (Aprovado) através da ponte pelo originalEvent
    if (originalEvent) {
      const vendor = await this.db.query.vendorProfiles.findFirst({ 
        where: eq(vendorProfiles.id, originalEvent.vendorId) 
      });
      
      const vendorUser = vendor ? await this.db.query.users.findFirst({ 
        where: eq(users.id, vendor.userId) 
      }) : null;

      if (vendorUser?.email && vendor) {
        this.emailsService.sendEditStatusNotification(
          vendorUser.email, 
          vendor.businessName, 
          editRequest.name, 
          'approved'
        );
      }
    }

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

    // Buscar o evento original antes do update para sabermos quem é o Vendor dono dele
    const originalEvent = await this.db.query.events.findFirst({
      where: eq(events.id, editRequest.eventId),
    });

    await this.db
      .update(eventEdits)
      .set({ status: 'rejected' })
      .where(eq(eventEdits.id, editId));

    const adminIdentifier = admin?.name || admin?.email || 'Undefined Admin ';

    await this.logsService.createLog(
      `Rejected structural updates for Event ID: ${editRequest.eventId}`, adminIdentifier
    );

    // 🌟 ENVIAR EMAIL EM BACKGROUND AO VENDOR (Rejeitado) através da ponte pelo originalEvent
    if (originalEvent) {
      const vendor = await this.db.query.vendorProfiles.findFirst({ 
        where: eq(vendorProfiles.id, originalEvent.vendorId) 
      });
      
      const vendorUser = vendor ? await this.db.query.users.findFirst({ 
        where: eq(users.id, vendor.userId) 
      }) : null;

      if (vendorUser?.email && vendor) {
        this.emailsService.sendEditStatusNotification(
          vendorUser.email, 
          vendor.businessName, 
          editRequest.name, 
          'rejected'
        );
      }
    }

    return { success: true, message: 'Changes rejected successfully.' };
  }
}