import {
  boolean,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  integer,
} from 'drizzle-orm/pg-core';

export const userTypeEnum = pgEnum('user_type', ['user', 'vendor']);

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    countryCode: varchar('country_code', { length: 5 }),
    userType: userTypeEnum('user_type').notNull().default('user'),
    superuser: boolean('superuser').notNull().default(false),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('email_idx').on(table.email),
  }),
);


/* =========================
        EVENTS TABLE
========================= */

export const events = pgTable('events', {
  id: serial('id').primaryKey(),

  name: varchar('name', { length: 255 }).notNull(),

  description: text('description').notNull(),

  location: varchar('location', { length: 255 }).notNull(),

  date: timestamp('date').notNull(),

  createdBy: integer('created_by').references(() => users.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});


/* =========================
           TYPES
========================= */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;