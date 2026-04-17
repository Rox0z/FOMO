import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';

@Injectable()
export class VendorApprovedGuard implements CanActivate {
  constructor(@Inject('DRIZZLE') private db: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const vendor = await this.db.query.vendorProfiles.findFirst({
      where: (vp, { eq }) => eq(vp.userId, user.id),
    });

    if (!vendor) {
      throw new ForbiddenException('Vendor profile not found');
    }

    if (vendor.status !== 'approved') {
      throw new ForbiddenException('Vendor not approved');
    }

    req.vendor = vendor; // útil para controllers
    return true;
  }
}