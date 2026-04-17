import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { Roles } from '../common/enums/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // -------------------------
  // PUBLIC - LIST EVENTS
  // -------------------------
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // -------------------------
  // PUBLIC - GET EVENT
  // -------------------------
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  // -------------------------
  // VENDOR - CREATE EVENT
  // -------------------------
  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.VENDOR)
  create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.create(dto, user.id);
  }

  // -------------------------
  // VENDOR OR ADMIN - UPDATE EVENT
  // -------------------------
  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.VENDOR, Roles.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.update(+id, dto, user);
  }

  // -------------------------
  // ADMIN ONLY - DELETE EVENT
  // -------------------------
  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.remove(+id, user);
  }
}