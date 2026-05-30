import { Controller, Get, Patch, Param, UseGuards, Delete } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/role.guard';
import { Roles } from '../common/enums/roles.enum';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { EventsService } from '../events/events.service';
import { EventEditsService } from '../event-edits/event-edits.service';

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@RolesDecorator(Roles.ADMIN)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private eventsEditService: EventEditsService
  ) {}

  @Get('overview')
  getOverview() {
    return this.adminService.overview();
  }

  @Get('requests')
  getRequestsCount() {
    return this.adminService.requests();
  }

  @Patch('vendors/:id/approve')
  approveVendor(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.approveVendor(+id, admin);
  }

  @Patch('vendors/:id/reject')
  rejectVendor(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.rejectVendor(+id, admin);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.banUser(+id, admin);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.unbanUser(+id, admin);
  }

  @Patch('events/:id/approve')
  async approveEvent(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.approveEvent(Number(id), admin);
  }

  @Patch('events/:id/reject')
  async rejectEvent(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.rejectEvent(Number(id), admin);
  }

  @Patch('events/edits/:editId/approve')
  approveEventEdit(@Param('editId') editId: string, @CurrentUser() admin: any) {
    return this.eventsEditService.approveEditRequest(+editId, admin);
  }
  
  @Patch('events/edits/:editId/reject')
  rejectEventEdit(@Param('editId') editId: string, @CurrentUser() admin: any) {
    return this.eventsEditService.rejectEditRequest(+editId, admin);
  }
}