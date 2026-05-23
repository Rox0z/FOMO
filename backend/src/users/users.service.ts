import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { and, sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema/users';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@Inject('DRIZZLE') private db: any) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.db
      .insert(users)
      .values({
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        countryCode: dto.countryCode,
        role: 'user',
        active: true,
      })
      .returning();

    const { password, ...user } = newUser[0];
    return user;
  }

  // 🎯 ATUALIZADO: Agora envia explicitamente os campos necessários para o modal do Admin
  async findAll() {
    return await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        active: users.active,
        createdAt: users.createdAt, 
        country: users.countryCode, 
        phone: users.phone,         
      })
      .from(users)
      .where(eq(users.role, 'user'));
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...safe } = user;
    return safe;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.email && dto.email !== existingUser.email) {
      const emailTaken = await this.db.query.users.findFirst({
        where: eq(users.email, dto.email),
      });

      if (emailTaken) {
        throw new ConflictException('Email already registered');
      }
    }

    const updateData: any = {};

    if (dto.email) updateData.email = dto.email;
    if (dto.name) updateData.name = dto.name;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.countryCode) updateData.countryCode = dto.countryCode;

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    const { password, ...user } = updated[0];
    return user;
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!result.length) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: `User ${id} deleted` };
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user || !user.password) return null;
    if (!user.active) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return user;
  }

  async count(): Promise<{ total: number; active: number }> {
    const [totalRes, activeRes] = await Promise.all([
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.role, 'user')),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(eq(users.role, 'user'), eq(users.active, true)))
    ]);

    return {
      total: Number(totalRes[0]?.count || 0),
      active: Number(activeRes[0]?.count || 0)
    };
  }

  async setActive(
  id: number,
  active: boolean,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = await this.db
      .update(users)
      .set({ active })
      .where(eq(users.id, id))
      .returning();

    const { password, ...safe } = updated[0];
    return safe;
  }
}