import { Injectable, Inject } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private vendorsService: VendorsService,
    private eventsService: EventsService,
    private logsService: LogsService,
  ) {}

  // DASHBOARD STATS
  async stats() {
    const [users, vendors, events] = await Promise.all([
      this.usersService.count(),
      this.vendorsService.count(),
      this.eventsService.count(),
    ]);

    return {
      users,
      vendors,
      events,
    };
  }


  // OVERVIEW (LISTS)
  async overview() {
    const [users, vendors, events] = await Promise.all([
      this.usersService.findAll(),
      this.vendorsService.findAll(),
      this.eventsService.findAllWithDetails(),
    ]);

    return {
      users,
      vendors,
      events,
    };
  }

  async approveEvent(id: number) {
    const event = await this.eventsService.setStatus(id, 'approved');
    
    // Grava o log de auditoria no Postgres através do teu LogsService
    await this.logsService.createLog(`Approved and published the event "${event.name}"`);
    return event;
  }

  async rejectEvent(id: number) {
    const event = await this.eventsService.setStatus(id, 'rejected');
    
    await this.logsService.createLog(`Rejected the publication of the event "${event.name}"`);
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
    await this.logsService.createLog(`Reactivated the access of the user "${nomeUtilizador}"`);
    
    return user;
  }
}
