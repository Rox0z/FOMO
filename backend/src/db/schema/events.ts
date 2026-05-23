import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { vendorProfiles } from './vendorProfiles';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),

  vendorId: integer('vendor_id')
    .notNull()
    .references(() => vendorProfiles.id),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),

  location: varchar('location', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),

  status: varchar('status', { length: 50 }).notNull().default ('pending'), 

  createdAt: timestamp('created_at').defaultNow(),
});