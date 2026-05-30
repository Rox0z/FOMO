import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { EventsService } from '../events/events.service';
import { eq } from 'drizzle-orm';
import { events } from '../db/schema/events';
import { eventEdits } from '../db/schema/event.edits';
import type { DrizzleDB } from '../drizzle';
import { EmailsService } from '../services/emails/emails.service';
import { users } from 'src/db/schema/users';
import { vendorProfiles } from 'src/db/schema/vendorProfiles';
import { tickets } from 'src/db/schema/tickets';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private vendorsService: VendorsService,
    private eventsService: EventsService,
    private logsService: LogsService,
    private emailsService: EmailsService,
    @Inject('DRIZZLE') private db: DrizzleDB
  ) {}

  // OVERVIEW (LISTS)
  // OVERVIEW (LISTS) - Resolvido no Backend com Left Joins Nativos
  async overview() {
    // 1. Procuramos os eventos trazendo o nome da empresa e a contagem de bilhetes correspondente
    const eventsWithDetails = await this.db
      .select({
        id: events.id,
        name: events.name,
        description: events.description,
        date: events.date,
        status: events.status,
        vendorId: events.vendorId,
        createdAt: events.createdAt,
        bannerUrl: events.bannerUrl,
        // Puxamos o businessName diretamente do Perfil do Vendor
        vendorName: vendorProfiles.businessName,
      })
      .from(events)
      .leftJoin(vendorProfiles, eq(events.vendorId, vendorProfiles.id));

    // 2. Buscamos a tabela de bilhetes plana para acoplar o total de categorias de cada evento
    const allTickets = await this.db
      .select()
      .from(tickets);

    // 3. Cruzamos a contagem para cada um dos eventos da lista
    const eventsListParsed = eventsWithDetails.map(evt => {
      const eventTickets = allTickets.filter(t => t.eventId === evt.id);
      return {
        ...evt,
        totalTicketsCount: eventTickets.length // Injeta a contagem real na raiz do objeto
      };
    });

    // 4. Executamos a restante busca paralela do teu método original
    const [users, vendors, pendingEdits] = await Promise.all([
      this.usersService.findAll(),
      this.vendorsService.findAll(),
      this.db.query.eventEdits.findMany({
        where: eq(eventEdits.status, 'pending')
      })
    ]);

    return {
      users,
      vendors,
      events: eventsListParsed || [], // Passamos a lista tratada
      eventEdits: pendingEdits
    };
  }

  async requests() {
    const pendingVendors = await this.db.query.vendorProfiles.findMany({
      where: eq(vendorProfiles.status, 'pending'),
    });

    const pendingPublishingEvents = await this.db.query.events.findMany({
      where: eq(events.status, 'pending'),
    });

    const pendingUpdatingEvents = await this.db.query.eventEdits.findMany({
      where: eq(eventEdits.status, 'pending'),
    });

    return {
      totalRequests: pendingVendors.length + pendingPublishingEvents.length + pendingUpdatingEvents.length,
      breakdown: {
        vendorApproval: pendingVendors.length,
        publishingEvent: pendingPublishingEvents.length,
        updatingEvent: pendingUpdatingEvents.length,
      }
    };
  }

 async approveEvent(id: number, admin: any) {
    const updated = await this.db.update(events).set({ status: 'approved' }).where(eq(events.id, id)).returning();
    if (!updated.length) throw new NotFoundException('Evento não encontrado');

    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;
    await this.logsService.createLog(`Approved Event ID: ${id} ("${updated[0].name}")`, adminIDentifier);

    const vendor = await this.db.query.vendorProfiles.findFirst({ where: eq(vendorProfiles.id, updated[0].vendorId) });
    const vendorUser = vendor ? await this.db.query.users.findFirst({ where: eq(users.id, vendor.userId) }) : null;
    if (vendorUser?.email && vendor) {
      this.emailsService.sendEventStatusNotification(vendorUser.email, vendor.businessName, updated[0].name, 'approved');
    }
    return updated[0];
  }

  async rejectEvent(id: number, admin: any) {
    const updated = await this.db.update(events).set({ status: 'rejected' }).where(eq(events.id, id)).returning();
    if (!updated.length) throw new NotFoundException('Evento não encontrado');

    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;
    await this.logsService.createLog(`Rejected Event ID: ${id} ("${updated[0].name}")`, adminIDentifier);

    const vendor = await this.db.query.vendorProfiles.findFirst({ where: eq(vendorProfiles.id, updated[0].vendorId) });
    const vendorUser = vendor ? await this.db.query.users.findFirst({ where: eq(users.id, vendor.userId) }) : null;
    if (vendorUser?.email && vendor) {
      this.emailsService.sendEventStatusNotification(vendorUser.email, vendor.businessName, updated[0].name, 'rejected');
    }
    return updated[0];
  }

  // -------------------------------------------------------------------------
  // GESTAO DE VENDORS (Aprova ou rejeita perfis de vendors e ativa/bloqueia login)
  // -------------------------------------------------------------------------
  async approveVendor(id: number, admin: any) {
    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;

    const profile = await this.db.transaction(async (tx) => {
      const [updatedProfile] = await tx
        .update(vendorProfiles)
        .set({ status: 'approved', updatedAt: new Date() })
        .where(eq(vendorProfiles.id, id))
        .returning();

      if (!updatedProfile) {
        throw new NotFoundException('Perfil de Vendor não encontrado');
      }

      // Sincronizacao automatica: ativa o login do utilizador na tabela users
      await tx
        .update(users)
        .set({ active: true })
        .where(eq(users.id, updatedProfile.userId));

      return updatedProfile;
    });

    const nomeEmpresa = profile?.businessName || `ID: ${id}`;
    await this.logsService.createLog(`Approved the vendor profile "${nomeEmpresa}" and activated user login`, adminIDentifier);

    const vendorUser = await this.usersService.findOne(profile.userId);
    if (vendorUser?.email) {
      this.emailsService.sendVendorStatusNotification(vendorUser.email, vendorUser.name, nomeEmpresa, 'approved');
    }
    return profile;
  }

  async rejectVendor(id: number, admin: any) {
    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;

    const profile = await this.db.transaction(async (tx) => {
      const [updatedProfile] = await tx
        .update(vendorProfiles)
        .set({ status: 'rejected', updatedAt: new Date() })
        .where(eq(vendorProfiles.id, id))
        .returning();

      if (!updatedProfile) {
        throw new NotFoundException('Perfil de Vendor não encontrado');
      }

      // Sincronizacao automatica: desativa o login do utilizador na tabela users
      await tx
        .update(users)
        .set({ active: false })
        .where(eq(users.id, updatedProfile.userId));

      return updatedProfile;
    });

    const nomeEmpresa = profile?.businessName || `ID: ${id}`;
    await this.logsService.createLog(`Rejected the vendor profile "${nomeEmpresa}" and blocked user login`, adminIDentifier);

    const vendorUser = await this.usersService.findOne(profile.userId);
    if (vendorUser?.email) {
      this.emailsService.sendVendorStatusNotification(vendorUser.email, vendorUser.name, nomeEmpresa, 'rejected');
    }
    return profile;
  }
  // -------------------------------------------------------------------------
  // CONTROLO DE ACESSOS (Altera o active de clientes ou logins de vendors)
  // -------------------------------------------------------------------------
  async banUser(id: number, admin: any) {
    const user = await this.usersService.setActive(id, false);
    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;
    const nomeUtilizador = user?.name || user?.email || `ID: ${id}`;
    await this.logsService.createLog(`Blocked the access of the user "${nomeUtilizador}"`, adminIDentifier);
    return user;
  }

  async unbanUser(id: number, admin: any) {
    const user = await this.usersService.setActive(id, true);
    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;
    const nomeUtilizador = user?.name || user?.email || `ID: ${id}`;
    await this.logsService.createLog(`Restored the access of the user "${nomeUtilizador}"`, adminIDentifier);
    return user;
  }

  async deleteEvent(id: number, admin: any) {
    const deletedEvent = await this.eventsService.remove(id, admin);
    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;
    await this.logsService.createLog(`Deleted permanently the event ID: ${id}`, adminIDentifier);
    return deletedEvent;
  }
}