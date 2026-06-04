import { pgTable, serial, integer, numeric } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { events } from './events';

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  eventId: integer('event_id').notNull().references(() => events.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});