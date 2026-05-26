import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { EventsService } from '../events/events.service';
import { eq } from 'drizzle-orm';
import { events } from '../db/schema/events';
import { eventEdits } from '../db/schema/event.edits';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private vendorsService: VendorsService,
    private eventsService: EventsService,
    private logsService: LogsService,
    @Inject('DRIZZLE') private db: any // Injetado para dar suporte direto a transações de tabelas combinadas
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

  async approveEvent(id: number) {
    const event = await this.eventsService.setStatus(id, 'approved');
    await this.logsService.createLog(`Approved the event "${event.name}"`);
    return event;
  }

  async rejectEvent(id: number) {
    const event = await this.eventsService.setStatus(id, 'rejected');
    await this.logsService.createLog(`Rejected the event "${event.name}"`);
    return event;
  }

  async approveVendor(id: number) {
    const profile = await this.vendorsService.setStatus(id, 'approved');
    const nomeEmpresa = profile?.businessName || `ID: ${id}`;
    await this.logsService.createLog(`Approved the commercial status of the vendor "${nomeEmpresa}"`);
    return profile;
  }

  async rejectVendor(id: number) {
    const profile = await this.vendorsService.setStatus(id, 'rejected');
    const nomeEmpresa = profile?.businessName || `ID: ${id}`;
    await this.logsService.createLog(`Rejected the commercial status of the vendor "${nomeEmpresa}"`);
    return profile;
  }

  // -------------------------------------------------------------------------
  // CONTROLO DE ACESSOS (Altera o active de clientes ou logins de vendors)
  // -------------------------------------------------------------------------
  async banUser(id: number) {
    const user = await this.usersService.setActive(id, false);
    const nomeUtilizador = user?.name || user?.email || `ID: ${id}`;
    await this.logsService.createLog(`Blocked the access of the user "${nomeUtilizador}"`);
    return user;
  }

  async unbanUser(id: number) {
    const user = await this.usersService.setActive(id, true);
    const nomeUtilizador = user?.name || user?.email || `ID: ${id}`;
    await this.logsService.createLog(`Restored the access of the user "${nomeUtilizador}"`);
    return user;
  }

  async deleteEvent(id: number, user: any) {
    const deletedEvent = await this.eventsService.remove(id, user);
    await this.logsService.createLog(`Deleted permanently the event ID: ${id}`);
    return deletedEvent;
  }
}