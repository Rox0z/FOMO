import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema/users';
import { vendorProfiles } from '../db/schema/vendorProfiles';
import { UsersService } from '../users/users.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    private usersService: UsersService,
    @Inject('DRIZZLE') private db: any,
  ) {}

  // -------------------------
  // REGISTER (USER + VENDOR PROFILE)
  // -------------------------
  async register(dto: CreateVendorDto) {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phone: dto.phone,
      countryCode: dto.countryCode,
    });

    await this.db
      .update(users)
      .set({
        role: 'vendor',
        active: false, // onboarding pending approval
      })
      .where(eq(users.id, user.id));

    const vendorProfile = await this.db
      .insert(vendorProfiles)
      .values({
        userId: user.id,
        businessName: dto.businessName,
        businessDescription: dto.businessDescription,
        status: 'pending',
      })
      .returning();

    return {
      user: {
        ...user,
        role: 'vendor',
        active: false,
      },
      vendorProfile: vendorProfile[0],
    };
  }

  // -------------------------
  // ADMIN LIST
  // -------------------------
  async findAll() {
    return this.db.query.vendorProfiles.findMany();
  }

  // -------------------------
  // GET BY USER ID
  // -------------------------
  async findOne(userId: number) {
    const vendor = await this.db.query.vendorProfiles.findFirst({
      where: (vp, { eq }) => eq(vp.userId, userId),
    });

    if (!vendor) throw new NotFoundException('Vendor not found');

    return vendor;
  }

  // -------------------------
  // VENDOR OWN PROFILE
  // -------------------------
  async findByUserId(userId: number) {
    return this.findOne(userId);
  }

  // -------------------------
  // UPDATE OWN PROFILE
  // -------------------------
  async updateByUserId(userId: number, dto: any) {
    const updated = await this.db
      .update(vendorProfiles)
      .set(dto)
      .where((vp, { eq }) => eq(vp.userId, userId))
      .returning();

    return updated[0];
  }

  // -------------------------
  // DELETE
  // -------------------------
  async remove(userId: number) {
    await this.db
      .delete(vendorProfiles)
      .where((vp, { eq }) => eq(vp.userId, userId));

    await this.db
      .delete(users)
      .where(eq(users.id, userId));

    return { message: `Vendor ${userId} removed` };
  }

  // -------------------------
  // COUNT (ADMIN DASHBOARD)
  // -------------------------
  async count() {
    const result = await this.db.query.vendorProfiles.findMany();
    return result.length;
  }

  async approve(userId: number) {
    await this.db
      .update(vendorProfiles)
      .set({ status: 'approved' })
      .where((vp, { eq }) => eq(vp.userId, userId));

    await this.db
      .update(users)
      .set({ active: true })
      .where(eq(users.id, userId));

    return { message: 'Vendor approved' };
  } 

  async reject(userId: number) {
    await this.db
      .update(vendorProfiles)
      .set({ status: 'rejected' })
      .where((vp, { eq }) => eq(vp.userId, userId));

    await this.db
      .update(users)
      .set({ active: false })
      .where(eq(users.id, userId));

    return { message: 'Vendor rejected' };
  }
}