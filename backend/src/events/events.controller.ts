import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { Roles } from '../common/enums/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from '../services/images.service';
import { EventEditsService } from 'src/event-edits/event-edits.service';

@ApiTags('events')
@ApiBearerAuth('access-token')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly imagesService: ImagesService,
    private readonly eventEditsService: EventEditsService,
  ) {}

  // -------------------------
  // PUBLIC - LIST APPROVED EVENTS
  // -------------------------
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // -------------------------
  // VENDOR - GET STATS
  // -------------------------
  @Get('my-stats')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.VENDOR)
  getMyStats(@CurrentUser() user: any) {
    return this.eventsService.getMyStats(user.id);
  }

  // -------------------------
  // VENDOR - LIST MY EVENTS
  // -------------------------
  @Get('my-events')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.VENDOR)
  findMyEvents(@CurrentUser() user: any) {
    return this.eventsService.findMyEvents(user.id);
  }

  // -------------------------
  // ADMIN - GET ANY EVENT (any status)
  // -------------------------
  @Get('admin/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  findOneAdmin(@Param('id') id: string) {
    return this.eventsService.findOneAdmin(+id);
  }

  // -------------------------
  // PUBLIC - GET APPROVED EVENT
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
  @RolesDecorator(Roles.VENDOR, Roles.ADMIN)
  @UseInterceptors(FileInterceptor('banner'))
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const bannerUrl = file ? await this.imagesService.uploadImage(file) : null;
    return this.eventsService.create(dto, user.id, bannerUrl);
  }

  // -------------------------
  // VENDOR - REQUEST EDIT (goes through approval workflow)
  // -------------------------
  @Put(':id/request-edit')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.VENDOR)
  @UseInterceptors(FileInterceptor('banner'))
  async requestEdit(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let newBannerUrl: string | null = null;
    if (file) {
      newBannerUrl = await this.imagesService.uploadImage(file);
    }
    return this.eventEditsService.createEditRequest(+id, dto, user.id, newBannerUrl || '');
  }

  // -------------------------
  // ADMIN ONLY - DIRECT UPDATE
  // Vendors must use the request-edit workflow above.
  // -------------------------
  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.update(+id, dto, user);
  }

  // -------------------------
  // ADMIN ONLY - DELETE
  // -------------------------
  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.remove(+id, user);
  }
}
