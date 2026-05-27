import { pgTable, serial, integer, varchar, text, timestamp, numeric, doublePrecision } from 'drizzle-orm/pg-core';
import { vendorProfiles } from './vendorProfiles';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  
  date: timestamp('date').notNull(),

  bannerUrl: text('banner_url'),

  ticketPrice: doublePrecision('ticket_price').notNull().default(0.00),

  maxCapacity: integer('max_capacity').notNull().default(100),
  ticketsSold: integer('tickets_sold').notNull().default(0),

  status: varchar('status', { length: 50 }).notNull().default('pending'), 

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});