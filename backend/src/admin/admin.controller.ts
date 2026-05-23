import { Controller, Get, Patch, Param, UseGuards, Delete } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/role.guard';
import { Roles } from '../common/enums/roles.enum';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@RolesDecorator(Roles.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.stats();
  }

  @Get('overview')
  getOverview() {
    return this.adminService.overview();
  }

  @Patch('vendors/:id/approve')
  approveVendor(@Param('id') id: string) {
    return this.adminService.approveVendor(+id);
  }

  @Patch('vendors/:id/reject')
  rejectVendor(@Param('id') id: string) {
    return this.adminService.rejectVendor(+id);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(+id);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(+id);
  }

  @Patch('events/:id/approve')
  async approveEvent(@Param('id') id: string) {
    return this.adminService.approveEvent(Number(id));
  }

  @Patch('events/:id/reject')
  async rejectEvent(@Param('id') id: string) {
    return this.adminService.rejectEvent(Number(id));
  }
}