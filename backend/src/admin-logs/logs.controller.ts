import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger'; // ← Garante este import para o @ApiBearerAuth
import { LogsService } from './logs.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { Roles } from '../common/enums/roles.enum';

@ApiBearerAuth('access-token')
@UseGuards(JwtGuard, RolesGuard)
@RolesDecorator(Roles.ADMIN)        
@Controller('admin/logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async findAll() {
    return this.logsService.findAll();
  }
}