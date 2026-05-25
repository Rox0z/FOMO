import { pgTable, serial, integer, text, varchar, timestamp, numeric } from 'drizzle-orm/pg-core';
import { events } from './events';

export const eventEdits = pgTable('event_edits', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  bannerUrl: text('banner_url'),
  ticketPrice: numeric('ticket_price', { precision: 10, scale: 2 }).notNull(),
  maxCapacity: integer('max_capacity').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending | approved | rejected
  createdAt: timestamp('created_at').defaultNow().notNull(),
});