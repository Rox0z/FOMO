import { pgTable, serial, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),

  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  countryCode: varchar('country_code', { length: 5 }),

  role: text('role').notNull().default('user'), // user | admin

  active: boolean('active').notNull().default(true),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});