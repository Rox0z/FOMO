import { Controller, Get, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('me')
  @UseGuards(JwtGuard)
  findMyTickets(@CurrentUser() user: any) {
    return this.ticketsService.findMyTickets(user.id);
  }
}