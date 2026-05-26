import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';

/**
 * Guards routes that require the authenticated vendor to own the target event.
 * Attaches `req.event` and `req.vendor` for downstream use.
 */
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

    // Fixed: use vendorId (not the non-existent createdBy column)
    if (event.vendorId !== vendor.id) {
      throw new ForbiddenException('You do not own this event');
    }

    req.event = event;
    req.vendor = vendor;
    return true;
  }
}
