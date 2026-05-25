import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { users } from '../db/schema/users';
import { vendorProfiles } from '../db/schema/vendorProfiles';
import { UsersService } from '../users/users.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor.dto';

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
    const result = await this.db
      .select({
        id: vendorProfiles.id,          
        userId: vendorProfiles.userId,
        businessName: vendorProfiles.businessName,             
        status: vendorProfiles.status,             
        createdAt: vendorProfiles.createdAt,    
        name: users.name,  
        email: users.email,                       
        phone: users.phone,                       
        country: users.countryCode,              
        active: users.active                      
      })
      .from(vendorProfiles)
      .innerJoin(users, eq(vendorProfiles.userId, users.id));

    return result;
  }


  // -------------------------
  // VENDOR OWN PROFILE
  // -------------------------
  async findByUserId(userId: number) {
    const result = await this.db
      .select({
        id: vendorProfiles.id,
        userId: vendorProfiles.userId,
        businessName: vendorProfiles.businessName,
        businessDescription: vendorProfiles.businessDescription,
        status: vendorProfiles.status,
        createdAt: vendorProfiles.createdAt,
        updatedAt: vendorProfiles.updatedAt,
        name: users.name,
        email: users.email,
        phone: users.phone,
        countryCode: users.countryCode,
      })
      .from(vendorProfiles)
      .innerJoin(users, eq(vendorProfiles.userId, users.id))
      .where(eq(vendorProfiles.userId, userId));

    if (!result || result.length === 0) {
      throw new NotFoundException('Perfil de Vendor não encontrado.');
    }

    return result[0]; // Retorna o objeto completo com os dados combinados
  }

  // -------------------------
  // UPDATE OWN PROFILE
  // -------------------------
  async updateByUserId(userId: number, dto: UpdateVendorProfileDto) {
  const updated = await this.db
    .update(vendorProfiles)
    .set({
      businessName: dto.businessName, // 🔒 Forçamos apenas os campos seguros
      businessDescription: dto.businessDescription,
      updatedAt: new Date(), // Atualizamos a data de modificação
    })
    .where(eq(vendorProfiles.userId, userId)) // 🎯 Sintaxe correta para update
    .returning();

  if (updated.length === 0) {
    throw new NotFoundException('Perfil de vendor não encontrado.');
  }

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
 async count(): Promise<{ total: number; approved: number; rejected: number; pending: number }> {
    const [totalRes, approvedRes, rejectedRes, pendingRes] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(vendorProfiles),
      this.db.select({ count: sql<number>`count(*)` }).from(vendorProfiles).where(eq(vendorProfiles.status, 'approved')),
      this.db.select({ count: sql<number>`count(*)` }).from(vendorProfiles).where(eq(vendorProfiles.status, 'rejected')),
      this.db.select({ count: sql<number>`count(*)` }).from(vendorProfiles).where(and(eq(vendorProfiles.status, 'pending')))
    ]);

    return {
      total: Number(totalRes[0]?.count || 0),
      approved: Number(approvedRes[0]?.count || 0),
      rejected: Number(rejectedRes[0]?.count || 0),
      pending: Number(pendingRes[0]?.count || 0)
    };
  }
  // ---------------------------------------------------------
  // SET STATUS (Focado estritamente na tabela de Vendors/Perfis)
  // ---------------------------------------------------------
  async setStatus(
    vendorId: number, // 🎯 Recebe o ID do perfil enviado pelo curl/painel
    status: 'approved' | 'pending' | 'rejected',
  ): Promise<any> {
    const updated = await this.db
      .update(vendorProfiles)
      .set({ 
        status: status,
        updatedAt: new Date()
      })
      .where(eq(vendorProfiles.id, vendorId))
      .returning();

    if (!updated.length) {
      throw new NotFoundException(`Vendor profile with ID ${vendorId} not found`);
    }

    return updated[0]; // Retorna o perfil atualizado (que contém lá dentro a propriedade .userId)
  }
}