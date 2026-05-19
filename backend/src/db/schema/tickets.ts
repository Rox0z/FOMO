import { pgTable, serial, integer, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';
import { orders } from './orders';

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  eventId: integer('event_id').notNull().references(() => events.id),
  orderId: integer('order_id').notNull().references(() => orders.id),
  qrCode: uuid('qr_code').defaultRandom().unique().notNull(), // O código do bilhete
  status: varchar('status', { length: 20 }).notNull().default('active'), // active | used
  createdAt: timestamp('created_at').defaultNow(),
});