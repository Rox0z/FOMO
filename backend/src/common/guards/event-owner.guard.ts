// backend/src/common/guards/event-owner.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { events } from '../../db/schema/events';
import { Roles } from '../enums/roles.enum';

@Injectable()
export class EventOwnerGuard implements CanActivate {
  constructor(@Inject('DRIZZLE') private db: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const eventId = Number(req.params.id);

    if (isNaN(eventId)) {
      throw new NotFoundException('Invalid event ID');
    }

    if (user.role === Roles.ADMIN) {
      return true;
    }

    const vendor = await this.db.query.vendorProfiles.findFirst({
      where: (vp, { eq }) => eq(vp.userId, user.id),
    });

    if (!vendor) {
      throw new ForbiddenException('Vendor profile not found.');
    }

    const event = await this.db.query.events.findFirst({
      where: (e, { eq }) => eq(e.id, eventId),
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.vendorId !== vendor.id) {
      throw new ForbiddenException('You do not have permission to modify this event.');
    }

    req.event = event;
    return true;
  }
}