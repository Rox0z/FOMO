import { pgTable, serial, integer, text, timestamp, varchar, numeric } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  eventId: integer('event_id').notNull().references(() => events.id),
  quantity: integer('quantity').notNull().default(1),
  // totalPrice stored in cents (integer) to avoid floating-point issues.
  // e.g. €18.50 → 1850. Divide by 100 for display.
  totalPrice: integer('total_price').notNull(),
  status: text('status').notNull().default('pending'), // pending | paid | cancelled
  paymentReference: varchar('payment_reference', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});
