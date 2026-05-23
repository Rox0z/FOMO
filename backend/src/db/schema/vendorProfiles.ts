import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const vendorProfiles = pgTable('vendor_profiles', {
  id: serial('id').primaryKey(),

  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id),

  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessDescription: text('business_description'),

  status: varchar('status', { length: 20 }).notNull().default('pending'),
  // pending | approved | rejected

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});