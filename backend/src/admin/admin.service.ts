import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { EventsService } from '../events/events.service';
import { eq } from 'drizzle-orm';
import { events } from '../db/schema/events';
import { eventEdits } from '../db/schema/event.edits';
import type { DrizzleDB } from '../drizzle';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private vendorsService: VendorsService,
    private eventsService: EventsService,
    private logsService: LogsService,
    @Inject('DRIZZLE') private db: DrizzleDB
  ) {}

  // OVERVIEW (LISTS)
  async overview() {
    const [users, vendors, eventsList, pendingEdits] = await Promise.all([
      this.usersService.findAll(),
      this.vendorsService.findAll(),
      this.eventsService.findAllWithDetails(),
      this.db.query.eventEdits.findMany({
        where: eq(eventEdits.status, 'pending')
      })
    ]);

    return {
      users,
      vendors,
      events: eventsList,
      eventEdits: pendingEdits
    };
  }

  async approveEvent(id: number, admin: any) {
    const event = await this.eventsService.setStatus(id, 'approved');
    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;
    await this.logsService.createLog(`Approved the event "${event.name}"`, adminIDentifier);
    return event;
  }

  async rejectEvent(id: number, admin: any) {
    const event = await this.eventsService.setStatus(id, 'rejected');
    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;
    await this.logsService.createLog(`Rejected the event "${event.name}"`, adminIDentifier);
    return event;
  }

  async approveVendor(id: number, admin: any) {
    const profile = await this.vendorsService.setStatus(id, 'approved');
    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;
    const nomeEmpresa = profile?.businessName || `ID: ${id}`;
    await this.logsService.createLog(`Approved the commercial status of the vendor "${nomeEmpresa}"`, adminIDentifier);
    return profile;
  }

  async rejectVendor(id: number, admin: any) {
    const profile = await this.vendorsService.setStatus(id, 'rejected');
    const adminIDentifier = admin?.name || admin?.email || `Undefined Admin`;
    const nomeEmpresa = profile?.businessName || `ID: ${id}`;
    await this.logsService.createLog(`Rejected the commercial status of the vendor "${nomeEmpresa}"`, adminIDentifier);
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