import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private vendorsService: VendorsService,
    private eventsService: EventsService,
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
      this.eventsService.findAll(),
    ]);

    return {
      users,
      vendors,
      events,
    };
  }

  
  // APPROVE VENDOR
  async approveVendor(id: number) {
    return this.vendorsService.approve(id);
  }

  // BAN USER
  async banUser(id: number) {
    return this.usersService.setActive(id, false);
  }

  // UNBAN USER
  async unbanUser(id: number) {
    return this.usersService.setActive(id, true);
  }
}