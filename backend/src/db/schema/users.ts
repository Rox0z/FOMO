import { pgTable, serial, text, varchar, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { Roles } from '../../common/enums/roles.enum';

export const roleEnum = pgEnum('user_role', [Roles.USER, Roles.VENDOR, Roles.ADMIN]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),

  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  countryCode: varchar('country_code', { length: 5 }),

  role: roleEnum('role').notNull().default(Roles.USER),

  active: boolean('active').notNull().default(true),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});