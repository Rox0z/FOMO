import { pgTable, serial, integer, text, timestamp, varchar, numeric } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  status: text('status').notNull().default('pending'), // pending | paid | cancelled
  paymentReference: varchar('payment_reference', { length: 255 }), // Ref. simulada
  createdAt: timestamp('created_at').defaultNow(),
});