import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';


export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .references(() => users.id),

  eventId: integer('event_id')
    .notNull()
    .references(() => events.id),

  quantity: integer('quantity').notNull().default(1),

  totalPrice: integer('total_price').notNull(),

  status: text('status').notNull().default('pending'),
  // pending | paid | cancelled

  createdAt: timestamp('created_at').defaultNow(),
});