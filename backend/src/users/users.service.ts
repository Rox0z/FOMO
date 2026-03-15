import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@Inject('DRIZZLE') private db: any) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      // Check if email already exists
      const existingUser = await this.db.query.users.findFirst({
        where: eq(users.email, createUserDto.email),
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Determine user type and active status
      const userType = createUserDto.userType || 'user';
      const isActive = userType === 'vendor' ? false : true; // Vendors start inactive, users start active

      // Insert user
      const newUser = await this.db
        .insert(users)
        .values({
          ...createUserDto,
          password: hashedPassword,
          userType,
          active: isActive,
          superuser: false, // New registrations are never superusers
        })
        .returning();

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser[0];
      return userWithoutPassword as Omit<User, 'password'>;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const allUsers = await this.db.query.users.findMany();
    return allUsers.map(({ password, ...user }) => user);
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user || null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user exists
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is already taken by another user
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailTaken = await this.db.query.users.findFirst({
        where: eq(users.email, updateUserDto.email),
      });

      if (emailTaken) {
        throw new ConflictException('Email already registered');
      }
    }

    // Hash password if provided
    const updateData = { ...updateUserDto };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update user
    const updatedUser = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser[0];
    return userWithoutPassword as Omit<User, 'password'>;
  }

  async remove(id: number): Promise<{ message: string }> {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.db.delete(users).where(eq(users.id, id));
    return { message: `User with ID ${id} has been deleted` };
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
