import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';

@Injectable()
export class EventOwnerGuard implements CanActivate {
  constructor(@Inject('DRIZZLE') private db: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const eventId = Number(req.params.id);

    const vendor = await this.db.query.vendorProfiles.findFirst({
      where: (vp, { eq }) => eq(vp.userId, user.id),
    });

    if (!vendor) {
      throw new ForbiddenException('Vendor not found');
    }

    const event = await this.db.query.events.findFirst({
      where: (e, { eq }) => eq(e.id, eventId),
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.createdBy !== vendor.id) {
      throw new ForbiddenException('You do not own this event');
    }

    req.event = event;
    return true;
  }
}