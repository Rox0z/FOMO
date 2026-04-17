import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
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

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(+id);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(+id);
  }
}